import { redirect } from "next/navigation";

export default async function PriceRedirect({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";
  redirect(`/${locale}/pricing`);
}
