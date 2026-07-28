import { pgEnum } from "drizzle-orm/pg-core";

/** Shared across `partners` and `subscriptions` — kept in one place to avoid a circular import between those two files. */
export const billingIntervalEnum = pgEnum("billing_interval", [
  "monthly",
  "yearly",
]);
