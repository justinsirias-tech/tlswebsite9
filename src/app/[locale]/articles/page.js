import SEOArticles from "../../../components/SEOArticles";
import prisma from "../../../lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'cn' }];
}

export async function generateMetadata({ params }) {
  try {
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
  } catch (error) {
    return { title: "Articles | That Laundry Shop" };
  }
}

export default async function ArticlesPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || "en";

  try {
    const t = await getTranslations({ locale, namespace: "Articles" });

    let articles = [];
    try {
      articles = await Promise.race([
        prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
    } catch (error) {
      console.error("Failed to load articles, retrying:", error);
      try {
        articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
      } catch (retryErr) {
        console.error("Articles retry failed:", retryErr);
        articles = [];
      }
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
  } catch (fatalError) {
    console.error("Fatal error rendering ArticlesPage:", fatalError);
    return (
      <>
        <div style={{ background: "var(--background)", paddingTop: "8rem", paddingBottom: "2rem", textAlign: "center" }}>
          <div className="container">
            <h1 style={{ fontSize: "3rem", color: "var(--primary)" }}>Articles</h1>
          </div>
        </div>
        <SEOArticles initialArticles={[]} />
      </>
    );
  }
}
