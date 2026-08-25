function buildFlagsSheet_(ss) {
  var sh = ss.insertSheet(SHEET_FLAGS);
  sh.getRange(1, 1, 1, 7).setValues([['Date', 'Project', 'Person', 'Dept', 'Issue Type', 'Detail', 'Tagged To']]);
  sh.setFrozenRows(1);
  return sh;
}

function buildDashboard_(ss) {
  var d = ss.insertSheet(SHEET_DASHBOARD);
  d.setColumnWidths(1, 6, 160);

  d.getRange('A1').setValue('OPS DASHBOARD').setFontSize(16).setFontWeight('bold');
  d.getRange('A2').setValue('Anyone not listed under Red Flags is clear (green) today.').setFontStyle('italic');

  // ---- Today's Red Flags ----
  d.getRange('A4').setValue('TODAY’S RED FLAGS').setFontWeight('bold');
  d.getRange('A5:F5').setValues([['Project', 'Person', 'Dept', 'Issue Type', 'Detail', 'Tagged To']]).setFontWeight('bold');
  d.getRange('A6').setFormula(
    '=IFERROR(FILTER(' + SHEET_FLAGS + '!B2:G,' + SHEET_FLAGS + '!A2:A=TODAY()),' +
    '{"— none —","","","","",""})'
  );

  // ---- Submission tracker ----
  d.getRange('A32').setValue('SUBMISSION TRACKER').setFontWeight('bold');
  d.getRange('A33').setFormula(
    '="Submitted: "&(COUNTA(' + SHEET_EMPLOYEES + '!A2:A)-IFERROR(COUNTA(UNIQUE(FILTER(' +
    SHEET_DAILY_RESPONSES + '!B2:B,' + SHEET_DAILY_RESPONSES + '!Q2:Q=TODAY()))),0))&' +
    '" of "&COUNTA(' + SHEET_EMPLOYEES + '!A2:A)'
  );
  d.getRange('A34').setValue('Missing today:');
  d.getRange('A35').setFormula(
    '=IFERROR(FILTER(' + SHEET_EMPLOYEES + '!A2:A,ISNA(MATCH(' + SHEET_EMPLOYEES + '!C2:C,' +
    'IFERROR(FILTER(' + SHEET_DAILY_RESPONSES + '!B2:B,' + SHEET_DAILY_RESPONSES + '!Q2:Q=TODAY()),{"—NONE—"}),0))),' +
    '"Everyone has submitted")'
  );

  // ---- Lead pipeline snapshot ----
  d.getRange('A55').setValue('LEAD PIPELINE SNAPSHOT').setFontWeight('bold');
  d.getRange('A56').setValue('Hot leads — follow-up due today or overdue:');
  d.getRange('A57:G57').setValues([['Lead ID', 'Clinic/Project', 'Contact', 'Mobile', 'Stage', 'Next Follow-up', 'Next Action']]).setFontWeight('bold');
  d.getRange('A58').setFormula(
    '=IFERROR({FILTER(' + SHEET_LEAD_RESPONSES + '!N2:N,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!C2:C,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!E2:E,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!F2:F,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!K2:K,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!L2:L,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY()),' +
    'FILTER(' + SHEET_LEAD_RESPONSES + '!M2:M,' + SHEET_LEAD_RESPONSES + '!I2:I="Hot",' + SHEET_LEAD_RESPONSES + '!L2:L<=TODAY())},' +
    '"No hot leads due")'
  );

  d.getRange('A78').setValue('Count by stage:');
  d.getRange('A79').setFormula(
    '=QUERY(' + SHEET_LEAD_RESPONSES + '!K2:K,"select A, count(A) where A is not null group by A label count(A) \'Count\'")'
  );

  applyConditionalFormatting_(d);
  d.setFrozenRows(2);
}

function applyConditionalFormatting_(d) {
  var range = d.getRange('A6:F30');
  var red = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=REGEXMATCH($E6,"Blocked|Support-Urgent")')
    .setBackground('#f4c7c3')
    .setRanges([range])
    .build();
  var yellow = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=REGEXMATCH($E6,"Payment|Client|Support-CanWait")')
    .setBackground('#fce8b2')
    .setRanges([range])
    .build();
  d.setConditionalFormatRules([red, yellow]);
}
