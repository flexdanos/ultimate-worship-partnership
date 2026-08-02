/**
 * Static "pay to" details shown on the /give form.
 */
export const ZELLE_DETAILS = {
  recipientName: "Francis Armah",
  phoneNumber: "6143286719",
};

export const CASH_APP_DETAILS = {
  cashtag: "$FrancisArmah1",
  accountName: "Francis Armah",
  phoneNumber: "6143286719",
};

export const MOBILE_MONEY_DETAILS = {
  provider: "Placeholder Mobile Money",
  accountName: "My Ultimate Worship",
  phoneNumber: "+233243652253",
};

export const PAYMENT_METHOD_LABELS: Record<
  "zelle" | "cash_app" | "mobile_money",
  string
> = {
  zelle: "Zelle",
  cash_app: "Cash App",
  mobile_money: "Mobile Money",
};
