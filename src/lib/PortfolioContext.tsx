"use client";

import React, { createContext, useContext } from "react";
import defaultDb from "@/lib/portfolio-db.json";
import type { PortfolioData as FullPortfolioData } from "@/lib/portfolio-service";

export type PortfolioData = typeof defaultDb & Partial<FullPortfolioData>;

const PortfolioContext = createContext<PortfolioData>(defaultDb);

export function PortfolioProvider({
  data,
  children,
}: {
  data?: PortfolioData | null;
  children: React.ReactNode;
}) {
  return (
    <PortfolioContext.Provider value={data || defaultDb}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioData(): PortfolioData {
  return useContext(PortfolioContext) || defaultDb;
}
