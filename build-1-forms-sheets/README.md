# Build 1 — Google Forms + Sheets + Apps Script

Two Google Forms (Daily Update, Lead Generation), one Google Sheet holding
both response tabs plus `Employees`, `Projects`, `Flags`, and `Dashboard`
tabs, wired together with Apps Script.

## v2 — clearer wording, real roster

Every Daily Update prompt is now a plain question ("Is anything stopping
you from finishing your work?" instead of "Blocked?"), with a short
example under the ones that needed one. There's also a new optional
"Any other projects you also touched today?" checkbox for people working
across multiple active projects at once — it's just a lightweight tag, not
a second detailed submission. The roster/departments are now the real
team (Amit/Coordination, Anil/Purchase, Rahul/Execution, Subrat/Design)
instead of placeholders, and the Support "Who" list uses their real names.

## What this does

- **Daily Update form** — 6-part structure with branching (skip pages you
  don't need, e.g. answering "Blocked: No" jumps straight past the Reason
  page). Name and Project are dropdowns; everything else is taps or a
  1-line answer.
- **Lead Generation form** — 14 flat fields, no branching. Lead ID
  (`DM-2026-XXX`) and Date are generated automatically on submit, not typed.
- **Dashboard tab** — Today's Red Flags (auto-filtered), Submission tracker
  ("Submitted: X of N", who's missing), Lead pipeline snapshot (hot leads
  due/overdue, count by stage), with red/yellow conditional formatting.
- **Employees / Projects tabs** — edit these directly in the Sheet; the
  form dropdowns re-sync automatically on edit (or immediately via the
  **Ops Tools → Sync Dropdowns Now** menu after opening the Sheet).

## One known limitation vs. the custom CRM build

Google Forms has no live cross-field logic — it can't auto-fill a separate
"Department" field just because you picked a name. So the Identity section
uses **one combined dropdown**: `Name — Department` (e.g. `Employee 1 —
Site`), built from the Employees tab. Department is still captured with a
single tap, just not as a visually separate field. Build 2 does true
reactive auto-fill.

## Setup (one time)

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the default `Code.gs` placeholder file.
3. Create 5 script files matching the ones in `AppsScript/` here
   (`Config.gs`, `Setup.gs`, `Triggers.gs`, `Dashboard.gs`, `Menu.gs`) and
   paste each file's contents in. File names must match — `Config.gs`'s
   constants are referenced by name from the others.
4. In the function dropdown at the top, select `setupAll`, click **Run**.
5. Google will prompt to authorize — it needs Forms, Sheets, and script
   trigger scopes. Approve it (you may need to click "Advanced → Go to
   [project] (unsafe)" since this is an unverified personal script — that
   warning is normal for your own Apps Script code, not a red flag).
   On a personal Gmail account, forms already don't require sign-in to
   respond by default (that restriction only exists for Workspace
   accounts), so there's nothing to configure here.
6. Open **Execution log** (View → Logs, or Ctrl+Enter) to get the
   Spreadsheet URL and the two published form links. Share the form links
   with employees / office staff.
7. Open the Spreadsheet → the `Employees` tab is already seeded with the
   real team; add anyone missing or fix a department there, and add your
   real `Projects`. The dropdowns sync automatically on setup and again on
   any edit to those tabs, or instantly via **Ops Tools → Sync Dropdowns
   Now**.
8. **Wait about a minute**, then check **View → Executions** for a
   `finishSetup` entry that ran after `setupAll` and finished without an
   error. Google Forms creates each form's response sheet with a short,
   variable delay that isn't reliably visible within `setupAll`'s own run
   — `finishSetup` is scheduled to run itself a minute later and finish
   naming things correctly once those sheets actually exist. If you submit
   a test response before it's finished, the response still saves, but the
   Dashboard/Flags logic won't process it. If `finishSetup` logs that it's
   still waiting, it'll retry automatically every minute for up to 6
   attempts — or just run `finishSetup` manually from the function
   dropdown at any point if you don't want to wait.

Re-running `setupAll()` later creates a **second, separate** spreadsheet
and pair of forms — it's meant to run once. If you need to rebuild, delete
the old Spreadsheet/Forms from Drive first.

## Verify it end-to-end

Make sure `finishSetup` has completed (step 8 above) before testing —
otherwise submissions won't show up in Flags/Dashboard even though they
saved. I wrote the Dashboard's formulas and conditional formatting
carefully but couldn't execute them against live Sheets from here (no
Google Forms/Sheets access in this environment) — please sanity-check
after setup:

1. Submit one Daily Update through a path that trips every flag: Blocked =
   Yes → Reason = Other Dept → tag a department; Payment = Yes; Client =
   Yes; Support = Yes-Urgent. Confirm 4 rows land in `Flags` and all 4 show
   up in the Dashboard's Red Flags table, red-highlighted.
2. Submit a second, "all clear" Daily Update. Confirm it does **not**
   appear in Red Flags, and the Submission tracker count goes up.
3. Submit one Lead with Priority = Hot and Next Follow-up Date = today.
   Confirm it gets a `DM-2026-XXX` Lead ID and shows in the pipeline
   snapshot.

If any formula shows `#N/A`/`#ERROR!` instead of the expected value, tell
me the cell reference and I'll fix the formula.

## Phase 2 (flagged, not built)

`Triggers.gs` has a stub `sendDailySummaryEmail()` function. To turn it
into an actual daily email later: write the email body, then add a
time-driven trigger for it (Apps Script editor → Triggers → Add Trigger →
choose the function → Time-driven).
