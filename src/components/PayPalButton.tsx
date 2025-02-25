
import { useEffect } from 'react';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton = () => {
  const { currentUser } = useAuth();
  const db = getFirestore();

  const saveSubscriptionToFirebase = async (subscriptionID: string, status: string) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to subscribe"
      });
      return;
    }

    try {
      const subscriptionRef = doc(db, 'subscriptions', currentUser.uid);
      await setDoc(subscriptionRef, {
        subscriptionID,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
        userID: currentUser.uid,
        email: currentUser.email
      });

      toast({
        title: "Subscription successful",
        description: "Your subscription has been activated"
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save subscription details"
      });
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AWuQ6kU30i41JYzn1XDBZ8ui59Lf2cxKkgkmxA98uAvcT-tUcP3VkHdNZABQyoLAJC3TgP2REv_aT7Y_&vault=true&intent=subscription";
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    script.onload = () => {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            plan_id: 'P-1C748246YG018921SM6DKRYI'
          });
        },
        onApprove: async function(data: any) {
          await saveSubscriptionToFirebase(
            data.subscriptionID,
            'ACTIVE'
          );
          console.log('Subscription successful:', data.subscriptionID);
        },
        onError: function(err: any) {
          console.error('PayPal Error:', err);
          toast({
            variant: "destructive",
            title: "PayPal Error",
            description: "There was an error processing your subscription"
          });
        }
      }).render('#paypal-button-container');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [currentUser]);

  return <div id="paypal-button-container" className="w-full max-w-xs mx-auto"></div>;
};

export default PayPalButton;
