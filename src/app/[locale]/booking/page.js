import BookingClient from "./BookingClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Booking" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `https://www.thatlaundryshop.com/${locale}/booking`,
    }
  };
}

export default function BookingPage() {
  return <BookingClient />;
}

