/**
 * Installed by installTriggers_() in Setup.gs as a single spreadsheet-level
 * onFormSubmit trigger (all 5 forms write into the same spreadsheet, so one
 * trigger routes by sheet name).
 *
 * Each department's *_Responses sheet (1-indexed, set by buildDepartmentForm_
 * item order in Setup.gs):
 *   1 Timestamp         8  Blocked            14 Client Note
 *   2 Name              9  Blocked Reason     15 Support Status
 *   3 Project           10 Tag Department     16 Support Who
 *   4 Also Worked On    11 Payment Pending    17 Support Detail
 *   5 Yesterday Status  12 Payment Note       18 Date (appended here)
 *   6 Yesterday Detail  13 Client Decision
 *   7 Today Plan
 *
 * LeadGen_Responses columns:
 *   1 Timestamp  5 Contact Person 9  Priority     13 Next Action
 *   2 Captured By 6 Mobile        10 Assigned To  14 Lead ID (appended)
 *   3 Clinic/Proj 7 Lead Source   11 Stage        15 Date (appended)
 *   4 City        8 Requirement   12 Next Follow-up
 */
function sheetNameToDept_(sheetName) {
  for (var i = 0; i < DEPARTMENT_PROFILES.length; i++) {
    if (DEPARTMENT_PROFILES[i].sheetName === sheetName) return DEPARTMENT_PROFILES[i].name;
  }
  return null;
}

function onAnyFormSubmit(e) {
  var sheetName = e.range.getSheet().getName();
  var dept = sheetNameToDept_(sheetName);
  if (dept) {
    handleDailyUpdateSubmit_(e, dept);
  } else if (sheetName === SHEET_LEAD_RESPONSES) {
    handleLeadGenSubmit_(e);
  }
}

function dateOnly_(value) {
  var d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function handleDailyUpdateSubmit_(e, dept) {
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var v = e.values;
  var today = dateOnly_(v[0]);

  sheet.getRange(row, 18).setValue(today);

  var person = v[1];
  var project = v[2];

  var flags = [];
  if (v[7] === 'Yes') {
    var reasonDetail = 'Reason: ' + v[8] + (v[8] === 'Other Dept' ? ' (' + v[9] + ')' : '');
    flags.push([today, project, person, dept, 'Blocked', reasonDetail, v[8] === 'Other Dept' ? v[9] : '']);
  }
  if (v[10] === 'Yes') {
    flags.push([today, project, person, dept, 'Payment', v[11], '']);
  }
  if (v[12] === 'Yes') {
    flags.push([today, project, person, dept, 'Client Decision', v[13], '']);
  }
  if (v[14] === 'Yes-Urgent' || v[14] === 'Yes-Can wait') {
    var issueType = v[14] === 'Yes-Urgent' ? 'Support-Urgent' : 'Support-CanWait';
    flags.push([today, project, person, dept, issueType, v[16], v[15]]);
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
 * Phase 2 — flagged, not built. Wiring this up later is just adding a
 * time-driven trigger for this function (Triggers > Add Trigger).
 */
function sendDailySummaryEmail() {
  throw new Error('Not wired up yet — Phase 2. See README.');
}
