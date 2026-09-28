import HomePage from "@/sections/HomePage";
import { sql } from "@/lib/db";
import fallbackDb from "@/lib/portfolio-db.json";
import { PortfolioProvider, PortfolioData } from "@/lib/PortfolioContext";

export const dynamic = "force-dynamic";

export default async function Page() {
  let portfolioData: PortfolioData = fallbackDb;

  try {
    const rows = await sql`SELECT data FROM portfolio ORDER BY id LIMIT 1`;
    if (rows && rows.length > 0 && rows[0].data) {
      portfolioData = rows[0].data as PortfolioData;
    }
  } catch (err) {
    console.error("Database fetch error, using local fallback:", err);
  }

  return (
    <PortfolioProvider data={portfolioData}>
      <HomePage />
    </PortfolioProvider>
  );
}
