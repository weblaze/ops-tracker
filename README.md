# Daily Update / Lead Gen — 4-way comparison

Two open questions, tested as 4 real, running systems so you can compare
rather than guess:

1. **Forms/Sheets vs. custom web app** — which system to build on.
2. **One shared form vs. 4 isolated department forms** — dad's suggestion,
   tested both ways in both systems.

Same underlying data and manager-dashboard logic everywhere (Red Flags,
Submission tracker, Lead pipeline) — only the employee-facing entry
experience differs between variants.

## The 4 variants

| # | What | Where | How to view it |
|---|---|---|---|
| 1 | Forms/Sheets, one form, clearer language | [`build-1-forms-sheets/`](build-1-forms-sheets/) | Run `setupAll()` — see its [README](build-1-forms-sheets/README.md) |
| 2 | Forms/Sheets, 4 isolated department forms | [`build-3-forms-departments/`](build-3-forms-departments/) | Separate Apps Script project — run `setupAll()` there too, see its [README](build-3-forms-departments/README.md) |
| 3 | Web app, one form, clearer language | `variant/web-updated-language` branch | Live preview: https://ops-tracker-git-varia-e2a356-arunavgangulyis-gmailcoms-projects.vercel.app |
| 4 | Web app, 4 isolated department routes | `variant/web-4-departments` branch | Live preview: https://ops-tracker-git-varia-e870ca-arunavgangulyis-gmailcoms-projects.vercel.app |

Variants 3 and 4 are **not merged into `main`** yet — `main` still holds
the original single-form web app (already live at
https://ops-tracker-topaz.vercel.app) so nothing changes for real use
until you pick a direction. The two preview links above update
automatically if either branch gets pushed to again.

For the manager dashboard on either preview: PIN is `1234`.

## What changed from the first round

- **Language**: every terse Daily Update prompt ("Blocked?") is now a
  plain question ("Is anything stopping you from finishing your work?"),
  with a short example only where it was genuinely ambiguous.
- **Real roster**: Amit (Coordination), Anil (Purchase), Rahul
  (Execution), Subrat (Design) — replacing the `Employee 1`–`5`
  placeholders everywhere.
- **Multi-project**: a primary project still drives the detailed fields;
  there's now an optional "also worked on today" tag for people touching
  more than one active project at once — lightweight, no extra detail
  fields, doesn't affect Red Flags.
- **Variants 2 and 4** (the isolated-department versions) drop the
  Department field entirely — it's implied by which form/route you're
  on — and word every question around that department's real work
  (Execution mentions AHU/installation, Design mentions drawings,
  Purchase mentions material orders, Coordination mentions client
  calls/handover). "Who can help" excludes whoever's currently filling
  the form in.

## Backlog — not built this round

Project states (a project being halted/restarted by a superior) and
multi-project *assignment* tracking beyond the lightweight tag above —
flagged as a real need, but the shape of it isn't settled yet. Worth a
dedicated round once you've picked a direction from this comparison.

## What to judge

Employee fill friction (does the isolated-department wording actually
read easier on-site?), manager scan time, setup/maintenance effort per
system, ongoing cost. Pick **one system** and **one form structure** to
standardize on — don't run 4 long-term.
