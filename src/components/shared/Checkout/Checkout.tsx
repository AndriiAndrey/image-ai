'use client';

import { FC, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { useToast } from '@/hooks/use-toast';
import { checkoutCredits } from '@/lib/actions/transaction.action';

import { Button } from '@/components/ui/button';

interface IProps {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}

const Checkout: FC<IProps> = ({ plan, amount, credits, buyerId }) => {
  const { toast } = useToast();

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      toast({
        title: 'Order placed!',
        description: 'You will receive an email confirmation',
        duration: 5000,
        className: 'success-toast',
      });
    }

    if (query.get('canceled')) {
      toast({
        title: 'Order canceled!',
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: 'error-toast',
      });
    }
  }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    await checkoutCredits(transaction);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="submit"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
        >
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

export default Checkout;
