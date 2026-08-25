export const YESTERDAY_STATUS = ["Completed", "Partial", "Not Started"] as const;
export const BLOCKED_REASONS = [
  "Material",
  "Drawing",
  "Client Decision",
  "Payment",
  "Labour",
  "Site Not Ready",
  "Other Dept",
  "Other",
] as const;
export const SUPPORT_STATUS = ["No", "Yes-Urgent", "Yes-Can wait"] as const;
export const SUPPORT_WHO = [
  "Prashant",
  "Rajeev",
  "Design",
  "Purchase",
  "Site",
  "Accounts",
  "Client",
  "Vendor",
] as const;

// Not specified exactly in the brief — sensible defaults, easy to edit here.
export const LEAD_SOURCES = ["Referral", "Website", "Cold Call", "Exhibition", "Social Media", "Walk-in", "Other"] as const;
export const REQUIREMENTS = ["IVF Lab", "Modular", "HVAC", "Interior", "Turnkey", "Other"] as const;
export const PRIORITIES = ["Hot", "Warm", "Cold"] as const;
export const STAGES = ["New", "Site Visit", "Quotation", "Negotiation", "Won", "Lost", "Hold"] as const;
