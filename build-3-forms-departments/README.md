# Build 3 — Google Forms, 4 isolated departments

The other Forms variant for this round's comparison. Instead of one Daily
Update form with a Department picker, each department gets its own form —
Execution (Rahul), Design (Subrat), Purchase (Anil), Coordination (Amit) —
worded around that department's real work. All 4 forms, plus one shared
Lead Generation form, write into a single spreadsheet so the manager
dashboard still shows everyone in one place.

## How this differs from `build-1-forms-sheets`

- **4 separate Daily Update forms**, not 1. Each drops the Department
  field entirely — it's implied by which form you opened — so Identity is
  just Name → Project.
- **Wording is tailored per department**: Execution's "today" question
  mentions AHU/installation, Design's mentions drawings/approval,
  Purchase's mentions orders/delivery, Coordination's mentions client
  calls/handover. Same underlying Yes/No + note structure everywhere, so
  the dashboard's Red Flags logic doesn't need to change.
- **"Who can help" excludes yourself** — Rahul's form doesn't offer
  "Rahul" as someone to ask for help.
- Same real roster, same "also worked on today" multi-project tag, same
  Lead Generation form as `build-1-forms-sheets`.

## Setup (one time)

1. Go to [script.google.com](https://script.google.com) → **New project**
   (a separate project from Build 1 — don't paste into the same one).
2. Delete the default `Code.gs` file.
3. Create 5 script files matching `AppsScript/` here (`Config.gs`,
   `Setup.gs`, `Triggers.gs`, `Dashboard.gs`, `Menu.gs`) and paste each
   file's contents in.
4. Select `setupAll` in the function dropdown, click **Run**, authorize
   the Forms/Sheets/trigger scopes it asks for.
5. Open the **Execution log** (Ctrl+Enter) for the Spreadsheet URL and
   the 5 form links (4 department forms + Lead Generation). Share each
   department's form only with that department's people.

Re-running `setupAll()` creates a second, separate set of everything.

## Verify it end-to-end

Same idea as Build 1's checklist, run once per department form: submit
one response tripping every flag (Blocked → Other Dept → tag a
department; Payment = Yes; Client = Yes; Support = Yes-Urgent), confirm
4 rows land in `Flags` and show up red/yellow on the Dashboard. Then
submit one Lead and confirm it shows in the pipeline snapshot.

I couldn't execute this against live Sheets from here — if a Dashboard
formula shows `#N/A`/`#ERROR!`, tell me the cell and I'll fix it.
