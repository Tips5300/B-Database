import { Capacitor } from '@capacitor/core';
import { InAppPurchases, PurchaseType, PurchaseState } from '@capacitor-community/in-app-purchases';

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
      // Initialize the in-app purchases plugin
      await InAppPurchases.initialize({
        enablePendingPurchases: true
      });

      // Set up purchase listeners
      InAppPurchases.addListener('purchaseUpdated', (purchase) => {
        this.handlePurchaseUpdate(purchase);
      });

      InAppPurchases.addListener('purchaseError', (error) => {
        console.error('Purchase error:', error);
      });

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
      const productIds = this.products.map(p => p.id);
      const result = await InAppPurchases.getProducts({ productIds });
      
      // Map the native products to our interface
      return result.products.map(product => ({
        id: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        type: this.getProductType(product.productId)
      }));
    } catch (error) {
      console.error('Failed to get products:', error);
      return this.products; // Fallback to static products
    }
  }

  static async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
      // Simulate purchase for web
      return this.simulatePurchase(productId);
    }

    try {
      const product = this.products.find(p => p.id === productId);
      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        };
      }

      const purchaseType = this.getPurchaseType(product.type);
      
      const result = await InAppPurchases.purchaseProduct({
        productId,
        productType: purchaseType
      });

      if (result.success) {
        return {
          success: true,
          productId,
          transactionId: result.transactionId
        };
      } else {
        return {
          success: false,
          error: result.error || 'Purchase failed'
        };
      }
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
      const result = await InAppPurchases.restorePurchases();
      
      return result.purchases.map(purchase => ({
        success: purchase.state === PurchaseState.Purchased,
        productId: purchase.productId,
        transactionId: purchase.transactionId
      }));
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  static async validateReceipt(receipt: string): Promise<boolean> {
    try {
      // In a real implementation, validate receipt with your backend
      // This would involve sending the receipt to your server for verification
      // with Apple App Store or Google Play Store
      
      // For now, return true as a placeholder
      return true;
    } catch (error) {
      console.error('Failed to validate receipt:', error);
      return false;
    }
  }

  static async finalizePurchase(transactionId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      await InAppPurchases.finalizePurchase({ transactionId });
      return true;
    } catch (error) {
      console.error('Failed to finalize purchase:', error);
      return false;
    }
  }

  private static handlePurchaseUpdate(purchase: any) {
    console.log('Purchase updated:', purchase);
    
    if (purchase.state === PurchaseState.Purchased) {
      // Handle successful purchase
      this.processPurchase(purchase);
    } else if (purchase.state === PurchaseState.Failed) {
      // Handle failed purchase
      console.error('Purchase failed:', purchase.error);
    }
  }

  private static async processPurchase(purchase: any) {
    try {
      // Validate the purchase with your backend
      const isValid = await this.validateReceipt(purchase.receipt);
      
      if (isValid) {
        // Update user's subscription status
        // This would typically involve calling your backend API
        console.log('Purchase validated successfully:', purchase.productId);
        
        // Finalize the purchase
        await this.finalizePurchase(purchase.transactionId);
      } else {
        console.error('Purchase validation failed');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  }

  private static getProductType(productId: string): 'subscription' | 'consumable' | 'non-consumable' {
    const product = this.products.find(p => p.id === productId);
    return product?.type || 'non-consumable';
  }

  private static getPurchaseType(type: string): PurchaseType {
    switch (type) {
      case 'subscription':
        return PurchaseType.Subscription;
      case 'consumable':
        return PurchaseType.Consumable;
      case 'non-consumable':
      default:
        return PurchaseType.NonConsumable;
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