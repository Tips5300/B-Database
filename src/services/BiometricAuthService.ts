import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

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
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor Biometric Auth
        const result = await BiometricAuth.checkBiometry();
        this.isSupported = result.isAvailable;
      } else {
        // Web platform - use WebAuthn
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          this.isSupported = available;
        } else {
          this.isSupported = false;
        }
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

      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor Biometric Auth
        try {
          const result = await BiometricAuth.authenticate({
            reason,
            cancelTitle: 'Cancel',
            allowDeviceCredential: true,
            iosFallbackTitle: 'Use Passcode',
            androidTitle: 'Biometric Authentication',
            androidSubtitle: 'Use your biometric to authenticate',
            androidConfirmationRequired: false,
            androidNegativeText: 'Cancel'
          });

          if (result.succeeded) {
            return {
              success: true,
              biometryType: this.mapBiometryType(result.biometryType)
            };
          } else {
            return {
              success: false,
              error: result.error || 'Authentication failed'
            };
          }
        } catch (error: any) {
          return {
            success: false,
            error: error.message || 'Biometric authentication failed'
          };
        }
      } else {
        // Web platform - use WebAuthn
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

        const credential = await navigator.credentials.get(credentialRequestOptions);
        
        if (credential) {
          return {
            success: true,
            biometryType: 'fingerprint'
          };
        } else {
          return {
            success: false,
            error: 'Authentication was cancelled'
          };
        }
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

      if (Capacitor.isNativePlatform()) {
        // Native platform - check if biometry is enrolled
        const biometryInfo = await BiometricAuth.checkBiometry();
        
        if (!biometryInfo.biometryType || biometryInfo.biometryType === BiometryType.none) {
          return {
            success: false,
            error: 'No biometric authentication methods are enrolled on this device'
          };
        }

        // Store that biometric is set up
        localStorage.setItem('biometric_enrolled', 'true');
        
        return {
          success: true,
          biometryType: this.mapBiometryType(biometryInfo.biometryType)
        };
      } else {
        // Web platform - use WebAuthn credential creation
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

        const credential = await navigator.credentials.create(credentialCreationOptions);
        
        if (credential) {
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
    if (Capacitor.isNativePlatform()) {
      return localStorage.getItem('biometric_enrolled') === 'true';
    } else {
      return !!localStorage.getItem('biometric_credential_id');
    }
  }

  static removeCredential(): void {
    if (Capacitor.isNativePlatform()) {
      localStorage.removeItem('biometric_enrolled');
    } else {
      localStorage.removeItem('biometric_credential_id');
    }
  }

  private static mapBiometryType(biometryType: BiometryType): 'fingerprint' | 'face' | 'iris' | 'voice' {
    switch (biometryType) {
      case BiometryType.fingerprintAuthentication:
      case BiometryType.touchId:
        return 'fingerprint';
      case BiometryType.faceAuthentication:
      case BiometryType.faceId:
        return 'face';
      case BiometryType.irisAuthentication:
        return 'iris';
      case BiometryType.voiceAuthentication:
        return 'voice';
      default:
        return 'fingerprint';
    }
  }
}