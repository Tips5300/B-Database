import { Capacitor } from '@capacitor/core';

export interface PurchaseProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  type: 'subscription' | 'consumable' | 'non-consumable';
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

export class InAppPurchaseService {
  private static products: PurchaseProduct[] = [
    {
      id: 'premium_monthly',
      title: 'Premium Monthly',
      description: 'Premium features for 1 month',
      price: '$9.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'premium_yearly',
      title: 'Premium Yearly',
      description: 'Premium features for 1 year (2 months free)',
      price: '$99.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'professional_monthly',
      title: 'Professional Monthly',
      description: 'Professional features for 1 month',
      price: '$29.99',
      currency: 'USD',
      type: 'subscription'
    },
    {
      id: 'remove_ads',
      title: 'Remove Ads',
      description: 'Remove all advertisements permanently',
      price: '$4.99',
      currency: 'USD',
      type: 'non-consumable'
    },
    {
      id: 'extra_storage',
      title: 'Extra Storage',
      description: 'Add 10GB of cloud storage',
      price: '$2.99',
      currency: 'USD',
      type: 'consumable'
    }
  ];

  static async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('In-app purchases not available on web platform');
      return false;
    }

    try {
      // Initialize the purchase plugin
      // This would typically involve setting up the store
      return true;
    } catch (error) {
      console.error('Failed to initialize in-app purchases:', error);
      return false;
    }
  }

  static async getProducts(): Promise<PurchaseProduct[]> {
    if (!Capacitor.isNativePlatform()) {
      return this.products;
    }

    try {
      // Fetch products from the store
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  static async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
      // Simulate purchase for web
      return this.simulatePurchase(productId);
    }

    try {
      // Perform actual purchase
      return {
        success: true,
        productId,
        transactionId: `txn_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  static async restorePurchases(): Promise<PurchaseResult[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      // Restore purchases from the store
      return [];
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  static async validateReceipt(receipt: string): Promise<boolean> {
    try {
      // Validate receipt with your backend
      return true;
    } catch (error) {
      console.error('Failed to validate receipt:', error);
      return false;
    }
  }

  private static async simulatePurchase(productId: string): Promise<PurchaseResult> {
    // Simulate purchase process for web demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      };
    }

    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        productId,
        transactionId: `web_txn_${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: 'Payment was declined'
      };
    }
  }
}