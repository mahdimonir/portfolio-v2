import { neon } from "@neondatabase/serverless";
import { prisma } from "./prisma";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(DATABASE_URL);
export { prisma };

export interface PortfolioRow {
  id: number;
  data: Record<string, unknown>;
  updated_at: string;
}

export interface AdminRow {
  id: number;
  username: string;
  password: string;
}
