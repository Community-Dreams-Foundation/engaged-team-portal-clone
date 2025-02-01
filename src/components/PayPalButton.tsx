import { useEffect } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton = () => {
  useEffect(() => {
    // Load PayPal SDK
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
        onApprove: function(data: any, actions: any) {
          console.log('Subscription successful:', data.subscriptionID);
          // You can add a toast notification here
        }
      }).render('#paypal-button-container');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paypal-button-container" className="w-full max-w-xs mx-auto"></div>;
};

export default PayPalButton;