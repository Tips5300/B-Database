export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    // Check for WebAuthn support in browsers
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        return available
      } catch {
        return false
      }
    }
    return false
  }

  static async authenticate(reason: string = 'Authenticate to access your data'): Promise<BiometricAuthResult> {
    try {
      if (!await this.isAvailable()) {
        return {
          success: false,
          error: 'Biometric authentication not available'
        }
      }

      // Simulate successful authentication for demo
      return {
        success: true,
        biometryType: 'fingerprint'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  static async enrollBiometric(): Promise<BiometricAuthResult> {
    return this.authenticate('Set up biometric authentication')
  }
}