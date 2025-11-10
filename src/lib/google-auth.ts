/**
 * Google Identity Services (GIS) Integration for Web
 * Handles Google OAuth sign-in using the new Google Identity Services
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (notificationCallback?: (notification: any) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type: 'standard' | 'icon';
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
}

/**
 * Load Google Identity Services script
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.accounts?.id) {
          reject(new Error('Google script failed to load'));
        }
      }, 10000);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Wait a bit for the script to initialize
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          resolve();
        } else {
          reject(new Error('Google Identity Services not available after script load'));
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Sign-In
 */
export async function initializeGoogleSignIn(
  onSuccess: (idToken: string) => void | Promise<void>,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID is not configured');
    }

    // Load Google script if not already loaded
    await loadGoogleScript();

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          if (response.credential) {
            await onSuccess(response.credential);
          } else {
            throw new Error('No credential received from Google');
          }
        } catch (error) {
          if (onError) {
            onError(error instanceof Error ? error : new Error('Unknown error'));
          } else {
            console.error('Google sign-in callback error:', error);
          }
        }
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to initialize Google Sign-In');
    if (onError) {
      onError(err);
    } else {
      console.error('Google Sign-In initialization error:', err);
    }
    throw err;
  }
}

/**
 * Trigger Google Sign-In prompt
 */
export async function promptGoogleSignIn(): Promise<void> {
  try {
    await loadGoogleScript();

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

    window.google.accounts.id.prompt();
  } catch (error) {
    console.error('Failed to prompt Google Sign-In:', error);
    throw error;
  }
}

/**
 * Render Google Sign-In button
 */
export async function renderGoogleButton(
  element: HTMLElement,
  config?: {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: string;
  }
): Promise<void> {
  try {
    await loadGoogleScript();

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID is not configured');
    }

    // Clear element first
    element.innerHTML = '';

    // Initialize if not already done
    if (!window.google.accounts.id) {
      await initializeGoogleSignIn(() => {});
    }

    // Render button
    window.google.accounts.id.renderButton(element, {
      type: config?.type || 'standard',
      theme: config?.theme || 'outline',
      size: config?.size || 'large',
      text: config?.text || 'signin_with',
      shape: config?.shape || 'rectangular',
      logo_alignment: 'left',
      width: config?.width,
    });
  } catch (error) {
    console.error('Failed to render Google button:', error);
    throw error;
  }
}

