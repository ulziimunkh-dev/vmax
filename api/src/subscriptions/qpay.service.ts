import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BankAppUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface QPayInvoiceResult {
  invoiceId: string;
  qrText: string;
  qrImage: string;
  urls: BankAppUrl[];
  isMock: boolean;
}

@Injectable()
export class QPayService {
  private readonly logger = new Logger(QPayService.name);
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly configService: ConfigService) {}

  private get baseUrl(): string {
    return (
      this.configService.get<string>('qpay.baseUrl') ||
      process.env.QPAY_BASE_URL ||
      'https://merchant.qpay.mn/v2'
    );
  }

  private get username(): string {
    return (
      this.configService.get<string>('qpay.username') ||
      process.env.QPAY_USERNAME ||
      ''
    );
  }

  private get password(): string {
    return (
      this.configService.get<string>('qpay.password') ||
      process.env.QPAY_PASSWORD ||
      ''
    );
  }

  private get invoiceCode(): string {
    return (
      this.configService.get<string>('qpay.invoiceCode') ||
      process.env.QPAY_INVOICE_CODE ||
      'VMAX_SUBSCRIPTION'
    );
  }

  private get callbackUrl(): string {
    return (
      this.configService.get<string>('qpay.callbackUrl') ||
      process.env.QPAY_CALLBACK_URL ||
      ''
    );
  }

  public isConfigured(): boolean {
    return Boolean(this.username && this.password);
  }

  /**
   * Obtain or refresh QPay Bearer token
   */
  async getAuthToken(): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    if (this.token && Date.now() < this.tokenExpiresAt - 60000) {
      return this.token;
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
      const res = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`QPay token request failed (${res.status}): ${text}`);
        return null;
      }

      const data = await res.json();
      if (data && data.access_token) {
        this.token = data.access_token;
        const expiresInSec = data.expires_in || 3600;
        this.tokenExpiresAt = Date.now() + expiresInSec * 1000;
        return this.token;
      }
    } catch (err) {
      this.logger.error('Failed to get QPay token', err);
    }

    return null;
  }

  /**
   * Create an invoice with QPay or generate mock invoice for sandbox/dev
   */
  async createInvoice(params: {
    senderInvoiceNo: string;
    receiverCode: string;
    description: string;
    amount: number;
  }): Promise<QPayInvoiceResult> {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const payload: Record<string, any> = {
          invoice_code: this.invoiceCode,
          sender_invoice_no: params.senderInvoiceNo,
          invoice_receiver_code: params.receiverCode,
          invoice_description: params.description,
          amount: params.amount,
        };

        if (this.callbackUrl) {
          payload.callback_url = `${this.callbackUrl}?invoice_id=${params.senderInvoiceNo}`;
        }

        const res = await fetch(`${this.baseUrl}/invoice`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            invoiceId: data.invoice_id,
            qrText: data.qr_text,
            qrImage: data.qr_image ? `data:image/png;base64,${data.qr_image}` : '',
            urls: Array.isArray(data.urls) ? data.urls : [],
            isMock: false,
          };
        } else {
          const errText = await res.text();
          this.logger.warn(`QPay invoice creation returned ${res.status}: ${errText}. Falling back to sandbox invoice.`);
        }
      } catch (err) {
        this.logger.error('Error calling QPay invoice API, falling back to sandbox mode', err);
      }
    }

    // Fallback: Sandbox / Simulated QPay Invoice
    return this.createMockInvoice(params);
  }

  /**
   * Check payment status on QPay
   */
  async checkPayment(invoiceId: string): Promise<{ isPaid: boolean; paymentId?: string }> {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const res = await fetch(`${this.baseUrl}/payment/check`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            object_type: 'INVOICE',
            object_id: invoiceId,
            offset: { page_number: 1, page_limit: 10 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Check if paid rows exist
          if (data && (data.count > 0 || (Array.isArray(data.rows) && data.rows.length > 0))) {
            const firstPayment = data.rows?.[0];
            return {
              isPaid: true,
              paymentId: firstPayment?.payment_id || String(data.rows?.[0]?.payment_id || Date.now()),
            };
          }
        }
      } catch (err) {
        this.logger.error(`Error checking QPay payment for ${invoiceId}`, err);
      }
    }

    return { isPaid: false };
  }

  /**
   * Generates a realistic mock invoice for development and sandbox testing
   */
  private createMockInvoice(params: {
    senderInvoiceNo: string;
    description: string;
    amount: number;
  }): QPayInvoiceResult {
    const mockInvoiceId = `QPAY-${params.senderInvoiceNo.slice(0, 8)}-${Date.now()}`;
    const qrText = `qpay://payment?invoice_id=${mockInvoiceId}&amount=${params.amount}&note=${encodeURIComponent(params.description)}`;
    
    // Quick QR server preview or SVG data
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&color=0e172a`;

    const mockBankApps: BankAppUrl[] = [
      {
        name: 'Хаан банк',
        description: 'Khan Bank',
        logo: 'https://qpay.mn/q/khanbank.png',
        link: `khanbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Голомт банк',
        description: 'Golomt Bank',
        logo: 'https://qpay.mn/q/golomt.png',
        link: `golomtbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Худалдаа Хөгжлийн Банк',
        description: 'TDB Online',
        logo: 'https://qpay.mn/q/tdb.png',
        link: `tdbbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Төрийн банк',
        description: 'State Bank (Golomt/Glmt)',
        logo: 'https://qpay.mn/q/state.png',
        link: `statebank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Хас банк',
        description: 'XacBank',
        logo: 'https://qpay.mn/q/xac.png',
        link: `xacbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'М Банк',
        description: 'MBank',
        logo: 'https://qpay.mn/q/mbank.png',
        link: `mbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'SocialPay',
        description: 'SocialPay (Golomt)',
        logo: 'https://qpay.mn/q/socialpay.png',
        link: `socialpay://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Мост Мони',
        description: 'Most Money',
        logo: 'https://qpay.mn/q/most.png',
        link: `mostmoney://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Ард Апп',
        description: 'Ard Financial Group',
        logo: 'https://qpay.mn/q/ard.png',
        link: `ardapp://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
      {
        name: 'Богд Банк',
        description: 'Bogd Bank',
        logo: 'https://qpay.mn/q/bogd.png',
        link: `bogdbank://q?qPay_QRcode=${encodeURIComponent(qrText)}`,
      },
    ];

    return {
      invoiceId: mockInvoiceId,
      qrText,
      qrImage,
      urls: mockBankApps,
      isMock: true,
    };
  }
}
