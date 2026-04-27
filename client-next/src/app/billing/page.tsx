"use client";

import React from 'react';
import { paymentService } from '@/lib/api';
import { Check } from 'lucide-react';

export default function BillingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for beginners',
      features: ['50 trades per month', 'Basic analytics', '1 Portfolio'],
      buttonText: 'Current Plan',
      tier: 'FREE'
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For professional traders',
      features: ['Unlimited trades', 'Advanced analytics', 'Unlimited Portfolios', 'AI Strategy Insights'],
      buttonText: 'Upgrade to Pro',
      tier: 'PRO',
      priceId: 'price_H5ggY9H6u9H' // Replace with real Stripe Price ID
    }
  ];

  const handleUpgrade = async (priceId: string) => {
    try {
      const { url } = await paymentService.createCheckoutSession(priceId);
      window.location.href = url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start checkout. Please check your Stripe configuration.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600">Choose the plan that fits your trading scale.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border bg-white p-8 shadow-sm flex flex-col ${plan.tier === 'PRO' ? 'ring-2 ring-indigo-600' : ''}`}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-gray-500">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm font-semibold text-gray-500">/month</span>
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="text-indigo-600" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                disabled={plan.tier === 'FREE'}
                className={`w-full rounded-lg py-3 text-sm font-bold transition ${
                  plan.tier === 'PRO' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
