import CryptoJS from 'crypto-js';

export class PinAuthService {
  private static readonly PIN_KEY = 'user_pin_hash';
  private static readonly SALT_KEY = 'pin_salt';
  private static readonly ATTEMPTS_KEY = 'pin_attempts';
  private static readonly LOCKOUT_KEY = 'pin_lockout';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  private static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  private static hashPin(pin: string, salt: string): string {
    return CryptoJS.PBKDF2(pin, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }

  static async setPin(pin: string): Promise<boolean> {
    try {
      if (pin.length < 4 || pin.length > 8) {
        throw new Error('PIN must be between 4 and 8 digits');
      }

      if (!/^\d+$/.test(pin)) {
        throw new Error('PIN must contain only numbers');
      }

      const salt = this.generateSalt();
      const hashedPin = this.hashPin(pin, salt);
      
      localStorage.setItem(this.PIN_KEY, hashedPin);
      localStorage.setItem(this.SALT_KEY, salt);
      
      // Clear any existing attempts/lockout
      localStorage.removeItem(this.ATTEMPTS_KEY);
      localStorage.removeItem(this.LOCKOUT_KEY);
      
      return true;
    } catch (error) {
      console.error('Failed to set PIN:', error);
      return false;
    }
  }

  static async verifyPin(pin: string): Promise<boolean> {
    try {
      // Check if locked out
      if (this.isLockedOut()) {
        throw new Error('Too many failed attempts. Please try again later.');
      }

      const storedHash = localStorage.getItem(this.PIN_KEY);
      const salt = localStorage.getItem(this.SALT_KEY);
      
      if (!storedHash || !salt) {
        return false;
      }

      const hashedPin = this.hashPin(pin, salt);
      const isValid = hashedPin === storedHash;
      
      if (isValid) {
        // Clear attempts on successful verification
        localStorage.removeItem(this.ATTEMPTS_KEY);
        localStorage.removeItem(this.LOCKOUT_KEY);
        return true;
      } else {
        // Increment failed attempts
        this.incrementFailedAttempts();
        return false;
      }
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }

  static hasPinSet(): boolean {
    return !!localStorage.getItem(this.PIN_KEY);
  }

  static removePin(): void {
    localStorage.removeItem(this.PIN_KEY);
    localStorage.removeItem(this.SALT_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
    localStorage.removeItem(this.LOCKOUT_KEY);
  }

  static getFailedAttempts(): number {
    const attempts = localStorage.getItem(this.ATTEMPTS_KEY);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  static getRemainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.getFailedAttempts());
  }

  static isLockedOut(): boolean {
    const lockoutTime = localStorage.getItem(this.LOCKOUT_KEY);
    if (!lockoutTime) return false;
    
    const lockoutEnd = parseInt(lockoutTime, 10);
    const now = Date.now();
    
    if (now < lockoutEnd) {
      return true;
    } else {
      // Lockout expired, clear it
      localStorage.removeItem(this.LOCKOUT_KEY);
      localStorage.removeItem(this.ATTEMPTS_KEY);
      return false;
    }
  }

  static getLockoutTimeRemaining(): number {
    const lockoutTime = localStorage.getItem(this.LOCKOUT_KEY);
    if (!lockoutTime) return 0;
    
    const lockoutEnd = parseInt(lockoutTime, 10);
    const now = Date.now();
    
    return Math.max(0, lockoutEnd - now);
  }

  private static incrementFailedAttempts(): void {
    const attempts = this.getFailedAttempts() + 1;
    localStorage.setItem(this.ATTEMPTS_KEY, attempts.toString());
    
    if (attempts >= this.MAX_ATTEMPTS) {
      const lockoutEnd = Date.now() + this.LOCKOUT_DURATION;
      localStorage.setItem(this.LOCKOUT_KEY, lockoutEnd.toString());
    }
  }

  static formatLockoutTime(milliseconds: number): string {
    const minutes = Math.ceil(milliseconds / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}