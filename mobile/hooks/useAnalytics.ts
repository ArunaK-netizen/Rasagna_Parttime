import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAnalytics = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      analytics().setUserId(user.uid);
    }
  }, [user]);

  const logEvent = async (eventName: string, params?: Record<string, any>) => {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const logProductSold = async (productId: string, employeeId: string, amount: number) => {
    await logEvent('product_sold', {
      product_id: productId,
      employee_id: employeeId,
      value: amount,
      currency: 'USD', // Adjust as needed
    });
  };

  const logTransactionAdded = async (totalAmount: number, paymentMethod: string) => {
    await logEvent('transaction_added', {
      value: totalAmount,
      currency: 'USD',
      payment_method: paymentMethod,
    });
  };

  return {
    logEvent,
    logProductSold,
    logTransactionAdded,
  };
};