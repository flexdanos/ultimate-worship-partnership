import Stripe from "stripe";

let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (_stripe) return _stripe;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
    typescript: true,
  });
  return _stripe;
}

/**
 * Singleton Stripe client, created lazily on first use so a missing
 * STRIPE_SECRET_KEY doesn't fail the build — only actual Stripe calls at runtime.
 * Import this anywhere you need server-side Stripe calls.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});
