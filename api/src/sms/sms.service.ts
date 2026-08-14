import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VerifySessionResponse {
  sessionId: string;
  phone: string;
  shortcode: string;
  text: string;
  smsUri: string;
  displayInstruction: string;
  expiresAt: string;
  isSandbox?: boolean;
}

export interface VerifyStatusResponse {
  sessionId: string;
  phone: string;
  sessionStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED';
  verifiedAt?: string;
  expiresAt?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly verifyApiKey: string;
  private readonly verifyBaseUrl: string = 'https://api.verify.mn';

  // Whitelisted phone numbers (auto-verified without SMS)
  private readonly whitelistedPhones = new Set(['89767700', '97689767700', '+97689767700']);

  // In-memory mock store for sandbox/local testing if API key is not yet set
  private sandboxSessions = new Map<string, { phone: string; text: string; status: 'PENDING' | 'VERIFIED' | 'EXPIRED'; expiresAt: number }>();

  constructor(private configService: ConfigService) {
    this.verifyApiKey = this.configService.get<string>('VERIFY_MN_API_KEY') || process.env.VERIFY_MN_API_KEY || '';
  }

  isWhitelisted(phone: string): boolean {
    const clean = (phone || '').replace(/\D/g, '');
    return clean === '89767700' || clean === '97689767700' || this.whitelistedPhones.has(clean) || this.whitelistedPhones.has(phone);
  }

  /**
   * 1. Create a verification session on Verify.mn
   * POST https://api.verify.mn/sessions
   */
  async createSession(phone: string): Promise<VerifySessionResponse> {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new BadRequestException('Утасны дугаар буруу байна.');
    }

    // Whitelist check: Auto-approve instantly
    if (this.isWhitelisted(cleanPhone)) {
      this.logger.log(`Phone ${cleanPhone} is whitelisted! Auto-approving verification.`);
      const sessionId = `whitelist-${Date.now()}`;
      this.sandboxSessions.set(sessionId, {
        phone: cleanPhone,
        text: '897677',
        status: 'VERIFIED',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
      return {
        sessionId,
        phone: cleanPhone,
        shortcode: '144773',
        text: '897677',
        smsUri: `sms:144773?body=897677`,
        displayInstruction: 'Whitelisted дугаар — автоматаар баталгаажлаа',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isSandbox: true,
      };
    }

    // Generate a unique 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (this.verifyApiKey) {
      try {
        this.logger.log(`Creating Verify.mn session for ${cleanPhone} with code ${code}...`);
        const res = await fetch(`${this.verifyBaseUrl}/sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.verifyApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: cleanPhone,
            text: code,
            responseSms: 'Vmax.mn: Tanii utasnii dugaar amjilttai batalgaajlaa.',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as VerifySessionResponse;
        this.logger.log(`Verify.mn session created: sessionId=${data.sessionId}`);
        return data;
      } catch (error: any) {
        this.logger.error(`Verify.mn API Error: ${error.message}`);
        return this.createSandboxSession(cleanPhone, code);
      }
    } else {
      this.logger.warn(`[SANDBOX] VERIFY_MN_API_KEY not configured. Running in sandbox mode for ${cleanPhone}`);
      return this.createSandboxSession(cleanPhone, code);
    }
  }

  /**
   * 2. Check session status on Verify.mn
   * GET https://api.verify.mn/sessions/:sessionId
   */
  async checkSessionStatus(sessionId: string): Promise<VerifyStatusResponse> {
    if (this.sandboxSessions.has(sessionId)) {
      const sandbox = this.sandboxSessions.get(sessionId)!;
      return {
        sessionId,
        phone: sandbox.phone,
        sessionStatus: sandbox.status,
        expiresAt: new Date(sandbox.expiresAt).toISOString(),
      };
    }

    try {
      const res = await fetch(`${this.verifyBaseUrl}/sessions/${sessionId}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as VerifyStatusResponse;
    } catch (error: any) {
      this.logger.error(`Error checking Verify.mn session ${sessionId}: ${error.message}`);
      throw new BadRequestException('Баталгаажуулалтын төлөв шалгахад алдаа гарлаа.');
    }
  }

  /**
   * Sandbox verification trigger for test mode
   */
  sandboxApprove(sessionId: string) {
    if (this.sandboxSessions.has(sessionId)) {
      const s = this.sandboxSessions.get(sessionId)!;
      s.status = 'VERIFIED';
      this.sandboxSessions.set(sessionId, s);
    }
  }

  private createSandboxSession(cleanPhone: string, code: string): VerifySessionResponse {
    const sessionId = `sandbox-${Date.now()}-${code}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    this.sandboxSessions.set(sessionId, {
      phone: cleanPhone,
      text: code,
      status: 'PENDING',
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      sessionId,
      phone: cleanPhone,
      shortcode: '144773',
      text: code,
      smsUri: `sms:144773?body=${encodeURIComponent(code)}`,
      displayInstruction: `144773 дугаарт "${code}" гэж SMS илгээнэ үү`,
      expiresAt,
      isSandbox: true,
    };
  }
}
