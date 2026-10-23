import { Building2, Baby, Heart, Briefcase, HelpCircle, Home, GraduationCap, Users, Wallet, BadgeCheck, Store } from "lucide-react";

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
  // Added Oct 2026 (feedback item 1). Each one only exists because entries carry it: a situation
  // with nothing behind it would show an empty page. check-data warns when that happens.
  { id: "children", icon: Users, emoji: "👨‍👩‍👧" },
  { id: "low-income", icon: Wallet, emoji: "💶" },
  { id: "employee", icon: BadgeCheck, emoji: "🧑‍💼" },
  { id: "self-employed", icon: Store, emoji: "🛠️" },
];
export const situationIds = new Set(situations.map((s) => s.id));

// Residence status (feedback item 9). It never hides a benefit: conditions on nationality and
// residence permits differ per benefit and are on each official page. It changes the guidance
// shown above the results, so nobody assumes everything applies to them.
export const statuses = [
  { id: "belgian", emoji: "🇧🇪" },
  { id: "eu", emoji: "🇪🇺" },
  { id: "non-eu", emoji: "🌍" },
  { id: "intl-student", emoji: "🎓" },
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
