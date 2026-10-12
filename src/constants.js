import { Building2, Baby, Heart, Briefcase, HelpCircle, Home, GraduationCap } from "lucide-react";

export const categories = [
  { id: "housing", icon: Building2, emoji: "🏠" },
  { id: "family", icon: Baby, emoji: "👶" },
  { id: "health", icon: Heart, emoji: "❤️" },
  { id: "employment", icon: Briefcase, emoji: "💼" },
  { id: "other", icon: HelpCircle, emoji: "✨" },
];

export const situations = [
  { id: "pregnancy", icon: Baby, emoji: "👶" },
  { id: "job-loss", icon: Briefcase, emoji: "💼" },
  { id: "buying-home", icon: Building2, emoji: "🏠" },
  { id: "renting", icon: Home, emoji: "🔑" },
  { id: "health-issue", icon: Heart, emoji: "❤️" },
  { id: "school", icon: GraduationCap, emoji: "🎓" },
];



// Health funds, grouped by national union: each union has a Dutch-speaking and a French-speaking
// side whose extras differ, so entries carry `health_funds` plus a region. "other" covers the
// public fund (HZIV/CAAMI), HR Rail and anything else — it shows no fund-specific extras.
export const healthFunds = [
  { id: "cm", short: "CM / MC", full: "Christelijke Mutualiteit · Mutualité chrétienne" },
  { id: "solidaris", short: "Solidaris", full: "Solidaris" },
  { id: "independent", short: "Helan / Partenamut", full: "Helan · Partenamut" },
  { id: "liberal", short: "LM / ML", full: "Liberale Mutualiteit · Mutualité Libérale" },
  { id: "neutral", short: "VNZ / Mutualia", full: "Vlaams & Neutraal Ziekenfonds · Mutualia · La Mutualité Neutre" },
  { id: "other", short: null, full: "HZIV/CAAMI, HR Rail…" },
];
export const healthFundIds = new Set(healthFunds.map((f) => f.id));
