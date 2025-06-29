export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export class BiometricAuthService {
  private static isSupported = false;
  private static hasCheckedSupport = false;

  static async isAvailable(): Promise<boolean> {
    if (this.hasCheckedSupport) {
      return this.isSupported;
    }

    try {
      // Check for WebAuthn support
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        this.isSupported = available;
      } else {
        this.isSupported = false;
      }
    } catch (error) {
      console.warn('Biometric check failed:', error);
      this.isSupported = false;
    }

    this.hasCheckedSupport = true;
    return this.isSupported;
  }

  static async authenticate(reason: string = 'Authenticate to access your data'): Promise<BiometricAuthResult> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device'
        };
      }

      // Create credential request options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: []
        }
      };

      // Request authentication
      const credential = await navigator.credentials.get(credentialRequestOptions);
      
      if (credential) {
        return {
          success: true,
          biometryType: 'fingerprint' // Default type
        };
      } else {
        return {
          success: false,
          error: 'Authentication was cancelled'
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Biometric authentication was denied'
        };
      } else if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Authentication was cancelled'
        };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed'
        };
      }
    }
  }

  static async enrollBiometric(): Promise<BiometricAuthResult> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device'
        };
      }

      // Create credential creation options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new TextEncoder().encode('user-' + Date.now());

      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'Database Manager',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: 'Database User',
            displayName: 'Database User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      };

      // Create credential
      const credential = await navigator.credentials.create(credentialCreationOptions);
      
      if (credential) {
        // Store credential ID for future use
        localStorage.setItem('biometric_credential_id', credential.id);
        
        return {
          success: true,
          biometryType: 'fingerprint'
        };
      } else {
        return {
          success: false,
          error: 'Failed to create biometric credential'
        };
      }
    } catch (error: any) {
      console.error('Biometric enrollment error:', error);
      
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Biometric enrollment was denied'
        };
      } else if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Enrollment was cancelled'
        };
      } else {
        return {
          success: false,
          error: 'Failed to set up biometric authentication'
        };
      }
    }
  }

  static hasCredential(): boolean {
    return !!localStorage.getItem('biometric_credential_id');
  }

  static removeCredential(): void {
    localStorage.removeItem('biometric_credential_id');
  }
}