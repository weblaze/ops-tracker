# Daily Update / Lead Gen — Forms+Sheets vs. Custom CRM

Same two forms (Daily Update, Lead Generation) and the same manager
dashboard logic, built two ways, for a 1–2 week side-by-side trial before
standardizing on one.

- **[build-1-forms-sheets/](build-1-forms-sheets/)** — Google Forms +
  Sheets + Apps Script. Deploy steps and known limitations in its
  [README](build-1-forms-sheets/README.md).
- **[build-2-custom-crm/](build-2-custom-crm/)** — Next.js + Supabase,
  deployed to Vercel. Live at https://ops-tracker-topaz.vercel.app —
  **change the placeholder PIN (`1234`) before real rollout**, see its
  [README](build-2-custom-crm/README.md).

## Before running the trial

Both builds currently have **placeholder** Employees/Projects data
(`Employee 1`–`5`, `Project 1`–`2`). Replace these with real names before
handing either link to employees:

- Build 1: edit the `Employees`/`Projects` tabs directly in the Sheet.
- Build 2: use `/dashboard/admin` on the live app.

## The one real feature gap between them

Google Forms has no live cross-field logic, so Build 1's Daily Update form
uses a single combined `Name — Department` dropdown instead of true
auto-fill. Build 2 does real reactive auto-fill in JS. Both still capture
Department in one tap either way — this doesn't affect fill speed, just
worth knowing when comparing "feature parity."

## What to judge after the trial

Per the original brief: employee fill friction, manager scan time to red
flags, setup/maintenance effort, ongoing cost. Pick one to standardize on
— don't run both long-term.
