// Facebook Auth Utility with HTTP/HTTPS & Auto-Init Fallback

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

let isFBInitialized = false;

export function loadFacebookSDK(appId: string): Promise<any> {
  const fbAppId = appId || import.meta.env.VITE_FACEBOOK_APP_ID || '291494419107518';

  return new Promise((resolve, reject) => {
    const initFB = () => {
      try {
        if (window.FB) {
          if (!isFBInitialized) {
            window.FB.init({
              appId: fbAppId,
              cookie: true,
              xfbml: true,
              version: 'v26.0',
            });
            isFBInitialized = true;
          }
          resolve(window.FB);
        } else {
          reject(new Error('Facebook SDK unavailable.'));
        }
      } catch (err) {
        reject(err);
      }
    };

    if (window.FB) {
      initFB();
      return;
    }

    window.fbAsyncInit = function () {
      initFB();
    };

    const existingScript = document.getElementById('facebook-jssdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Facebook SDK script blocked or unavailable.'));
      document.body.appendChild(script);
    }
  });
}

function openOAuthPopup(appId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://www.facebook.com/v26.0/dialog/oauth?client_id=${encodeURIComponent(
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
  const isHttps = window.location.protocol === 'https:';

  // 1. Try FB SDK Login first if running on HTTPS
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
    } catch (e) {
      console.warn('Facebook SDK Login failed, falling back to OAuth popup:', e);
    }
  }

  // 2. Direct Popup OAuth Fallback
  return openOAuthPopup(fbAppId);
}
