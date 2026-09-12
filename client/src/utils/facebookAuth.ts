// Facebook Auth Utility with HTTP/HTTPS Fallback

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export function loadFacebookSDK(appId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      return resolve(window.FB);
    }

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: appId || '291494419107518',
          cookie: true,
          xfbml: true,
          version: 'v19.0',
        });
        resolve(window.FB);
      } else {
        reject(new Error('Facebook SDK failed to initialize.'));
      }
    };

    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Facebook SDK script blocked or unavailable.'));
    document.body.appendChild(script);
  });
}

function openOAuthPopup(appId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
      appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email,public_profile`;

    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'Facebook Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      return reject(new Error('Popup window was blocked by your browser. Please allow popups.'));
    }

    const checkPopup = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('Facebook нэвтрэх цонх хаагдлаа.'));
          return;
        }

        const popupUrl = popup.location.href;
        if (popupUrl && (popupUrl.includes('access_token=') || popupUrl.includes('#access_token='))) {
          const hash = popup.location.hash || popup.location.search;
          const params = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          popup.close();
          clearInterval(checkPopup);

          if (accessToken) {
            resolve(accessToken);
          } else {
            reject(new Error('Facebook token авч чадсангүй.'));
          }
        }
      } catch {
        // Ignore cross-origin security restrictions while redirecting
      }
    }, 400);
  });
}

export async function loginWithFacebook(appId?: string): Promise<string> {
  const fbAppId = appId || import.meta.env.VITE_FACEBOOK_APP_ID || '291494419107518';

  // 1. If running on HTTP (e.g. http://localhost:5173), skip FB.login() to avoid HTTPS requirement error
  const isHttps = window.location.protocol === 'https:';

  if (isHttps) {
    try {
      const FB = await loadFacebookSDK(fbAppId);
      return await new Promise<string>((resolve, reject) => {
        FB.login(
          (response: any) => {
            if (response?.authResponse?.accessToken) {
              resolve(response.authResponse.accessToken);
            } else {
              reject(new Error('FB_SDK_LOGIN_FAILED'));
            }
          },
          { scope: 'public_profile,email' }
        );
      });
    } catch {
      // Fallback to OAuth popup dialog
    }
  }

  // 2. Direct Popup OAuth Fallback (Works on HTTP localhost & production)
  return openOAuthPopup(fbAppId);
}
