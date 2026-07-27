import { z } from "zod";

export const pledgeFormSchema = z
  .object({
    amount: z.coerce.number().positive("Enter an amount greater than 0"),
    tier: z.enum(["friend_of_worship", "worship_partner", "altar_builder"]),
    paymentMethod: z.enum(["bank_transfer", "mobile_money"]),
    transactionReference: z.string().nullish(),
    payerPhone: z.string().nullish(),
    note: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "mobile_money" && !data.payerPhone?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["payerPhone"],
        message: "The phone number used for the Mobile Money payment is required",
      });
    }
  });

export type PledgeFormValues = z.infer<typeof pledgeFormSchema>;
