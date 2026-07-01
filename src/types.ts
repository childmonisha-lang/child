/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: "AI & TECH" | "WEB3 PULSE" | "MONEY MAKING";
  content: string;
  readingTime: string;
  author: string;
  authorTitle?: string;
  authorAvatar?: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
  isFeatured?: boolean;
}

export interface TerminalMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  isCommand?: boolean;
  commandName?: string;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  isUp: boolean;
}

export interface ProtocolMetric {
  id: string;
  name: string;
  category: string;
  tvl: number; // in Millions/Billions
  apy: number; // annual percentage yield
  activeNodes: number;
  growth24h: number; // percentage
  status: "OPTIMAL" | "NOMINAL" | "STABLE" | "DEGRADED";
}
