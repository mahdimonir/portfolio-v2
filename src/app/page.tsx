import HomePage from "@/sections/HomePage";
import { PortfolioProvider, PortfolioData } from "@/lib/PortfolioContext";
import { getNormalizedPortfolio } from "@/lib/portfolio-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const portfolioData = (await getNormalizedPortfolio()) as unknown as PortfolioData;

  return (
    <PortfolioProvider data={portfolioData}>
      <HomePage />
    </PortfolioProvider>
  );
}
