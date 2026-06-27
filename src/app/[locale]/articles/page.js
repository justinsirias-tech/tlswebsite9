import SEOArticles from "../../../components/SEOArticles";
import prisma from "../../../lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Articles" });

  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `https://www.thatlaundryshop.com/${locale}/articles`,
    }
  };
}

export default async function ArticlesPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: "Articles" });

  let articles = [];
  try {
    articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Failed to load articles:", error);
  }

  return (
    <>
      <div style={{ background: "var(--background)", paddingTop: "8rem", paddingBottom: "2rem", textAlign: "center" }}>
        <div className="container">
          <h1 style={{ fontSize: "3rem", color: "var(--primary)" }}>{t("title")}</h1>
          <p style={{ color: "var(--text-light)", fontSize: "1.2rem", marginTop: "1rem" }}>{t("subtitle")}</p>
        </div>
      </div>
      <SEOArticles initialArticles={articles} />
    </>
  );
}

