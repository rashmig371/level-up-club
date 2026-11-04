import { days as engineeringDays, weeks as engineeringWeeks } from "./plan.js?v=2";
import { days as businessDays, weeks as businessWeeks } from "./business-plan.js?v=2";

export function getPlan(key = "sde") {
  if (key === "sde") return { key, days: engineeringDays, weeks: engineeringWeeks };
  if (key === "business") return { key, days: businessDays, weeks: businessWeeks };
  throw new Error("Unknown study track. Use the engineering or program & business track links.");
}
