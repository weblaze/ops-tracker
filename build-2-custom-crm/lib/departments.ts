export type DepartmentProfile = {
  slug: string;
  name: string;
  label: string;
  todayHint: string;
  blockedHint: string;
  paymentQuestion: string;
  paymentHint: string;
  clientQuestion: string;
  clientHint?: string;
};

/**
 * One entry per department, in this variant's "4 isolated forms" model —
 * no shared Department picker, each route is worded around that
 * department's real KRAs. Same underlying daily_updates shape as the
 * single-form variant, just tailored wording per route.
 */
export const DEPARTMENT_PROFILES: DepartmentProfile[] = [
  {
    slug: "execution",
    name: "Execution",
    label: "Execution",
    todayHint: "e.g. install AHU unit at Site X, fix control panel wiring",
    blockedHint: "e.g. AHU part missing, site not ready for installation",
    paymentQuestion: "Is a pending payment slowing down material or vendor work?",
    paymentHint: "e.g. vendor won't deliver AHU parts until paid",
    clientQuestion: "Are you waiting on the client for an on-site decision?",
    clientHint: "e.g. access, placement approval",
  },
  {
    slug: "design",
    name: "Design",
    label: "Design",
    todayHint: "e.g. finish 2D layout for Site Y, submit drawing to client",
    blockedHint: "e.g. waiting on site measurements, client hasn't approved layout",
    paymentQuestion: "Is a pending payment slowing this down?",
    paymentHint: "e.g. design fee not cleared",
    clientQuestion: "Are you waiting on the client or team head to approve a drawing?",
    clientHint: "e.g. layout sign-off",
  },
  {
    slug: "purchase",
    name: "Purchase",
    label: "Purchase",
    todayHint: "e.g. order cement for Site Z, follow up on delayed delivery",
    blockedHint: "e.g. vendor delay, site not ready to receive material",
    paymentQuestion: "Is a pending payment holding up an order or delivery?",
    paymentHint: "e.g. vendor needs advance before shipping",
    clientQuestion: "Are you waiting on the client to decide something?",
    clientHint: "e.g. material brand or spec choice",
  },
  {
    slug: "coordination",
    name: "Coordination",
    label: "Coordination",
    todayHint: "e.g. client call for Project X, prepare handover documents",
    blockedHint: "e.g. waiting on site report, client unavailable",
    paymentQuestion: "Is a pending payment affecting this?",
    paymentHint: "e.g. client hasn't cleared invoice",
    clientQuestion: "Are you waiting on the client to decide something?",
  },
];

export function getDepartmentProfile(slug: string): DepartmentProfile | undefined {
  return DEPARTMENT_PROFILES.find((p) => p.slug === slug);
}
