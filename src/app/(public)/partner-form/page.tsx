import { PartnerIntakeForm } from "./partner-intake-form";

export const metadata = {
  title: "Become a Partner | My Ultimate Worship",
  description:
    "Fill in your details to begin your partnership with My Ultimate Worship.",
};

export default function PartnerFormPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold">Become a Partner</h1>
        <p className="text-muted-foreground">
          Fill in your details below. You&apos;ll be redirected to our secure
          payment page to complete your partnership.
        </p>
      </div>
      <PartnerIntakeForm />
    </div>
  );
}
