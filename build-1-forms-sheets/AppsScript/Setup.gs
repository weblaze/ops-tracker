/**
 * Run setupAll() ONCE from the Apps Script editor (select it in the function
 * dropdown, click Run, authorize the requested scopes). It creates the
 * container spreadsheet, both forms with their branching logic, the
 * Dashboard + Flags sheets, and installs the triggers. Re-running it later
 * will create a second, separate set of everything — see the README.
 */
function setupAll() {
  var ss = SpreadsheetApp.create(SS_NAME);
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SS_ID', ss.getId());

  seedMasterTabs_(ss);
  var dailyForm = buildDailyUpdateForm_(ss);
  var leadForm = buildLeadGenForm_(ss);
  buildFlagsSheet_(ss);
  buildDashboard_(ss);

  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  installTriggers_(ss.getId());

  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Daily Update form (share this link): ' + dailyForm.getPublishedUrl());
  Logger.log('Lead Generation form (share this link): ' + leadForm.getPublishedUrl());
}

function seedMasterTabs_(ss) {
  var emp = ss.insertSheet(SHEET_EMPLOYEES);
  emp.getRange(1, 1, 1, 3).setValues([['Name', 'Department', 'Name — Department (auto, do not edit)']]);
  var placeholderEmployees = [
    ['Employee 1', 'Site'],
    ['Employee 2', 'Design'],
    ['Employee 3', 'Purchase'],
    ['Employee 4', 'Accounts'],
    ['Employee 5', 'Site']
  ];
  emp.getRange(2, 1, placeholderEmployees.length, 2).setValues(placeholderEmployees);
  emp.getRange(2, 3, 200).setFormula('=ARRAYFORMULA(IF(A2:A200="","",A2:A200&" — "&B2:B200))');
  emp.setFrozenRows(1);
  emp.setColumnWidths(1, 3, 180);

  var proj = ss.insertSheet(SHEET_PROJECTS);
  proj.getRange(1, 1, 1, 2).setValues([['Project Name', 'Status (Active/Inactive)']]);
  var placeholderProjects = [
    ['Project 1', 'Active'],
    ['Project 2', 'Active']
  ];
  proj.getRange(2, 1, placeholderProjects.length, 2).setValues(placeholderProjects);
  proj.setFrozenRows(1);
  proj.setColumnWidths(1, 2, 180);
}

/**
 * Builds the Daily Update form. Page order (top to bottom) and the branch
 * map below must match the column-index comments in Triggers.gs / Dashboard.gs
 * if you ever edit this — the response sheet's columns follow item order.
 */
function buildDailyUpdateForm_(ss) {
  var props = PropertiesService.getScriptProperties();
  var form = FormApp.create('Daily Update');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setDescription('Daily status — takes under 90 seconds. Pick your name and tap through.');

  // --- Page 1: Identity ---
  var nameDeptItem = form.addListItem().setTitle('Name — Department').setRequired(true);
  props.setProperty('ITEM_NAMEDEPT_ID', String(nameDeptItem.getId()));

  var projectItem = form.addListItem().setTitle('Project').setRequired(true);
  props.setProperty('ITEM_PROJECT_ID', String(projectItem.getId()));

  // --- Page 2: Yesterday ---
  form.addPageBreakItem().setTitle('Yesterday');
  var yesterdayStatus = form.addMultipleChoiceItem().setTitle('Yesterday — Status').setRequired(true);

  // --- Page 3: Yesterday detail (only if Partial / Not Started) ---
  form.addPageBreakItem().setTitle('Yesterday — What');
  form.addParagraphTextItem().setTitle('What (1 line)').setRequired(true);

  // --- Page 4: Today ---
  var pbTodayReal = form.addPageBreakItem().setTitle('Today');
  form.addParagraphTextItem().setTitle('Today — what will be completed').setRequired(true);

  yesterdayStatus.setChoices([
    yesterdayStatus.createChoice('Completed', pbTodayReal),
    yesterdayStatus.createChoice('Partial', FormApp.PageNavigationType.CONTINUE),
    yesterdayStatus.createChoice('Not Started', FormApp.PageNavigationType.CONTINUE)
  ]);

  // --- Page 5: Blocked ---
  form.addPageBreakItem().setTitle('Blocked');
  var blocked = form.addMultipleChoiceItem().setTitle('Blocked?').setRequired(true);

  // --- Page 6: Reason (only if Blocked = Yes) ---
  form.addPageBreakItem().setTitle('Blocked — Reason');
  var reason = form.addListItem().setTitle('Reason').setChoiceValues(BLOCKED_REASONS).setRequired(true);

  // --- Page 7: Tag Department (only if Reason = Other Dept) ---
  form.addPageBreakItem().setTitle('Tag Department');
  var tagDept = form.addListItem().setTitle('Tag Department').setRequired(true);
  props.setProperty('ITEM_TAGDEPT_ID', String(tagDept.getId()));

  // --- Page 8: Payment ---
  var pbPayment = form.addPageBreakItem().setTitle('Payment');
  var payment = form.addMultipleChoiceItem().setTitle('Payment pending and affecting this work?').setRequired(true);

  blocked.setChoices([
    blocked.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    blocked.createChoice('No', pbPayment)
  ]);
  reason.setChoices(BLOCKED_REASONS.map(function (r) {
    return reason.createChoice(r, r === 'Other Dept' ? FormApp.PageNavigationType.CONTINUE : pbPayment);
  }));

  // --- Page 9: Payment note (only if Payment = Yes) ---
  form.addPageBreakItem().setTitle('Payment — Note');
  form.addParagraphTextItem().setTitle('Payment note (1 line)').setRequired(true);

  // --- Page 10: Client ---
  var pbClient = form.addPageBreakItem().setTitle('Client');
  var client = form.addMultipleChoiceItem().setTitle('Client decision required?').setRequired(true);

  payment.setChoices([
    payment.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    payment.createChoice('No', pbClient)
  ]);

  // --- Page 11: Client note (only if Client = Yes) ---
  form.addPageBreakItem().setTitle('Client — Note');
  form.addParagraphTextItem().setTitle('Client note (1 line)').setRequired(true);

  // --- Page 12: Support ---
  var pbSupport = form.addPageBreakItem().setTitle('Support');
  var support = form.addMultipleChoiceItem().setTitle('Support needed?').setRequired(true);

  client.setChoices([
    client.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    client.createChoice('No', pbSupport)
  ]);

  // --- Page 13: Support detail (only if Support != No) ---
  form.addPageBreakItem().setTitle('Support — Detail');
  var supportWho = form.addListItem().setTitle('Who').setChoiceValues(SUPPORT_WHO).setRequired(true);
  form.addParagraphTextItem().setTitle('What (1 line)').setRequired(true);

  support.setChoices([
    support.createChoice('No', FormApp.PageNavigationType.SUBMIT),
    support.createChoice('Yes-Urgent', FormApp.PageNavigationType.CONTINUE),
    support.createChoice('Yes-Can wait', FormApp.PageNavigationType.CONTINUE)
  ]);

  props.setProperty('DAILY_FORM_ID', String(form.getId()));
  return form;
}

function buildLeadGenForm_(ss) {
  var props = PropertiesService.getScriptProperties();
  var form = FormApp.create('Lead Generation');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  form.setCollectEmail(false);
  form.setDescription('Office staff only — new lead capture.');

  var capturedBy = form.addListItem().setTitle('Captured By').setRequired(true);
  props.setProperty('ITEM_CAPTUREDBY_ID', String(capturedBy.getId()));

  form.addTextItem().setTitle('Clinic/Project Name').setRequired(true);
  form.addTextItem().setTitle('City').setRequired(true);
  form.addTextItem().setTitle('Contact Person').setRequired(true);
  form.addTextItem().setTitle('Mobile').setRequired(true);
  form.addListItem().setTitle('Lead Source').setChoiceValues(LEAD_SOURCES).setRequired(true);
  form.addCheckboxItem().setTitle('Requirement').setChoiceValues(REQUIREMENTS).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Priority').setChoiceValues(PRIORITIES).setRequired(true);

  var assignedTo = form.addListItem().setTitle('Assigned To').setRequired(true);
  props.setProperty('ITEM_ASSIGNEDTO_ID', String(assignedTo.getId()));

  form.addListItem().setTitle('Stage').setChoiceValues(STAGES).setRequired(true);
  form.addDateItem().setTitle('Next Follow-up Date').setRequired(true);
  form.addParagraphTextItem().setTitle('Next Action (1 line)').setRequired(true);

  props.setProperty('LEAD_FORM_ID', String(form.getId()));
  return form;
}

function installTriggers_(ssId) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    ScriptApp.deleteTrigger(t);
  });
  var ss = SpreadsheetApp.openById(ssId);
  ScriptApp.newTrigger('onAnyFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('onMasterTabEdit').forSpreadsheet(ss).onEdit().create();
}
