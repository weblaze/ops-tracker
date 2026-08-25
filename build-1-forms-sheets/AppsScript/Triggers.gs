/**
 * Installed by installTriggers_() in Setup.gs as a single spreadsheet-level
 * onFormSubmit trigger (both forms write into the same spreadsheet, so one
 * trigger routes by sheet name rather than installing two).
 *
 * DailyUpdate_Responses columns (1-indexed, set by form item order — see
 * buildDailyUpdateForm_ in Setup.gs):
 *   1 Timestamp        7  Blocked            13 Client Note
 *   2 Name — Dept      8  Blocked Reason     14 Support Status
 *   3 Project           9  Tag Department     15 Support Who
 *   4 Yesterday Status 10 Payment Pending    16 Support Detail
 *   5 Yesterday Detail 11 Payment Note       17 Date (appended here)
 *   6 Today Plan       12 Client Decision
 *
 * LeadGen_Responses columns:
 *   1 Timestamp  5 Contact Person 9  Priority     13 Next Action
 *   2 Captured By 6 Mobile        10 Assigned To  14 Lead ID (appended)
 *   3 Clinic/Proj 7 Lead Source   11 Stage        15 Date (appended)
 *   4 City        8 Requirement   12 Next Follow-up
 */
function onAnyFormSubmit(e) {
  var sheetName = e.range.getSheet().getName();
  if (sheetName === SHEET_DAILY_RESPONSES) {
    handleDailyUpdateSubmit_(e);
  } else if (sheetName === SHEET_LEAD_RESPONSES) {
    handleLeadGenSubmit_(e);
  }
}

function dateOnly_(value) {
  var d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function handleDailyUpdateSubmit_(e) {
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var v = e.values;
  var today = dateOnly_(v[0]);

  sheet.getRange(row, 17).setValue(today);

  var parts = String(v[1]).split(' — ');
  var person = parts[0] || '';
  var dept = parts[1] || '';
  var project = v[2];

  var flags = [];
  if (v[6] === 'Yes') {
    var reasonDetail = 'Reason: ' + v[7] + (v[7] === 'Other Dept' ? ' (' + v[8] + ')' : '');
    flags.push([today, project, person, dept, 'Blocked', reasonDetail, v[7] === 'Other Dept' ? v[8] : '']);
  }
  if (v[9] === 'Yes') {
    flags.push([today, project, person, dept, 'Payment', v[10], '']);
  }
  if (v[11] === 'Yes') {
    flags.push([today, project, person, dept, 'Client Decision', v[12], '']);
  }
  if (v[13] === 'Yes-Urgent' || v[13] === 'Yes-Can wait') {
    var issueType = v[13] === 'Yes-Urgent' ? 'Support-Urgent' : 'Support-CanWait';
    flags.push([today, project, person, dept, issueType, v[15], v[14]]);
  }

  if (flags.length) {
    var flagsSheet = sheet.getParent().getSheetByName(SHEET_FLAGS);
    flagsSheet.getRange(flagsSheet.getLastRow() + 1, 1, flags.length, 7).setValues(flags);
  }
}

function handleLeadGenSubmit_(e) {
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var v = e.values;

  var year = new Date().getFullYear();
  var props = PropertiesService.getScriptProperties();
  var key = 'LEAD_SEQ_' + year;
  var seq = Number(props.getProperty(key) || '0') + 1;
  props.setProperty(key, String(seq));
  var leadId = 'DM-' + year + '-' + pad3_(seq);

  sheet.getRange(row, 14).setValue(leadId);
  sheet.getRange(row, 15).setValue(dateOnly_(v[0]));
}

function onMasterTabEdit(e) {
  var name = e.range.getSheet().getName();
  if (name === SHEET_EMPLOYEES || name === SHEET_PROJECTS) {
    syncDropdowns();
  }
}

/**
 * Phase 2 — flagged in the brief, not built. Wiring this up later is just
 * adding a time-driven trigger for this function (Triggers > Add Trigger).
 */
function sendDailySummaryEmail() {
  throw new Error('Not wired up yet — Phase 2. See README.');
}
