/**
 * Run setupAll() ONCE from the Apps Script editor. Creates the container
 * spreadsheet, 4 department-specific Daily Update forms + 1 Lead
 * Generation form, the Dashboard + Flags sheets, and installs triggers.
 * Re-running later creates a second, separate set of everything.
 */
function setupAll() {
  var ss = SpreadsheetApp.create(SS_NAME);
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SS_ID', ss.getId());

  seedMasterTabs_(ss);

  var formIds = {};
  DEPARTMENT_PROFILES.forEach(function (profile) {
    var form = buildDepartmentForm_(ss, profile);
    formIds[profile.key] = form.getPublishedUrl();
  });
  var leadForm = buildLeadGenForm_(ss);

  buildFlagsSheet_(ss);
  buildDashboard_(ss);

  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  installTriggers_(ss.getId());
  syncDropdowns();

  Logger.log('Spreadsheet: ' + ss.getUrl());
  DEPARTMENT_PROFILES.forEach(function (profile) {
    Logger.log(profile.name + ' form (share with that team): ' + formIds[profile.key]);
  });
  Logger.log('Lead Generation form (share with office staff): ' + leadForm.getPublishedUrl());
}

function seedMasterTabs_(ss) {
  var emp = ss.insertSheet(SHEET_EMPLOYEES);
  emp.getRange(1, 1, 1, 2).setValues([['Name', 'Department']]);
  var placeholderEmployees = [
    ['Amit', 'Coordination'],
    ['Anil', 'Purchase'],
    ['Rahul', 'Execution'],
    ['Subrat', 'Design']
  ];
  emp.getRange(2, 1, placeholderEmployees.length, 2).setValues(placeholderEmployees);
  emp.setFrozenRows(1);
  emp.setColumnWidths(1, 2, 180);

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
 * One form per department. No Department field at all — it's implied by
 * which form you're on. Column order (1-indexed) matches the map at the
 * top of Triggers.gs; keep both in sync if you edit this.
 */
function buildDepartmentForm_(ss, profile) {
  var props = PropertiesService.getScriptProperties();
  var form = FormApp.create(profile.formTitle);
  var beforeNames = ss.getSheets().map(function (s) { return s.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  renameNewResponseSheet_(ss, beforeNames, profile.sheetName);
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setDescription('Daily status for ' + profile.name + ' — takes under 90 seconds.');

  // --- Page 1: Identity ---
  var nameItem = form.addListItem().setTitle("Who's filling this out?").setRequired(true);
  props.setProperty('ITEM_NAME_' + profile.key, String(nameItem.getId()));

  var projectItem = form.addListItem().setTitle('Which project is this mainly about today?').setRequired(true);
  props.setProperty('ITEM_PROJECT_' + profile.key, String(projectItem.getId()));

  var alsoProjectsItem = form.addCheckboxItem()
    .setTitle('Any other projects you also touched today?')
    .setHelpText('Optional — just a quick tag, no extra detail needed.');
  props.setProperty('ITEM_ALSOPROJECTS_' + profile.key, String(alsoProjectsItem.getId()));

  // --- Page 2: Yesterday ---
  form.addPageBreakItem().setTitle('Yesterday');
  var yesterdayStatus = form.addMultipleChoiceItem().setTitle("How did yesterday's work go?").setRequired(true);

  // --- Page 3: Yesterday detail (only if Partial / Not Started) ---
  form.addPageBreakItem().setTitle('Yesterday — What');
  form.addParagraphTextItem().setTitle("What's left from yesterday?")
    .setHelpText('e.g. wiring not finished, waiting on materials').setRequired(true);

  // --- Page 4: Today ---
  var pbTodayReal = form.addPageBreakItem().setTitle('Today');
  form.addParagraphTextItem().setTitle('What will you get done today?')
    .setHelpText(profile.todayHint).setRequired(true);

  yesterdayStatus.setChoices([
    yesterdayStatus.createChoice('Completed', pbTodayReal),
    yesterdayStatus.createChoice('Partial', FormApp.PageNavigationType.CONTINUE),
    yesterdayStatus.createChoice('Not Started', FormApp.PageNavigationType.CONTINUE)
  ]);

  // --- Page 5: Blocked ---
  form.addPageBreakItem().setTitle('Blocked');
  var blocked = form.addMultipleChoiceItem()
    .setTitle('Is anything stopping you from finishing your work?')
    .setHelpText(profile.blockedHint).setRequired(true);

  // --- Page 6: Reason (only if Blocked = Yes) ---
  form.addPageBreakItem().setTitle('Blocked — Reason');
  var reason = form.addListItem().setTitle("What's the reason?").setChoiceValues(BLOCKED_REASONS).setRequired(true);

  // --- Page 7: Tag Department (only if Reason = Other Dept) ---
  form.addPageBreakItem().setTitle('Tag Department');
  var tagDept = form.addListItem().setTitle('Which team is holding this up?').setRequired(true);
  props.setProperty('ITEM_TAGDEPT_' + profile.key, String(tagDept.getId()));

  // --- Page 8: Payment ---
  var pbPayment = form.addPageBreakItem().setTitle('Payment');
  var payment = form.addMultipleChoiceItem()
    .setTitle(profile.paymentQuestion)
    .setHelpText(profile.paymentHint).setRequired(true);

  blocked.setChoices([
    blocked.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    blocked.createChoice('No', pbPayment)
  ]);
  reason.setChoices(BLOCKED_REASONS.map(function (r) {
    return reason.createChoice(r, r === 'Other Dept' ? FormApp.PageNavigationType.CONTINUE : pbPayment);
  }));

  // --- Page 9: Payment note (only if Payment = Yes) ---
  form.addPageBreakItem().setTitle('Payment — Note');
  form.addParagraphTextItem().setTitle('Quick note')
    .setHelpText("e.g. vendor invoice unpaid, client hasn't released advance").setRequired(true);

  // --- Page 10: Client ---
  var pbClient = form.addPageBreakItem().setTitle('Client');
  var clientItem = form.addMultipleChoiceItem()
    .setTitle(profile.clientQuestion)
    .setRequired(true);
  if (profile.clientHint) clientItem.setHelpText(profile.clientHint);

  payment.setChoices([
    payment.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    payment.createChoice('No', pbClient)
  ]);

  // --- Page 11: Client note (only if Client = Yes) ---
  form.addPageBreakItem().setTitle('Client — Note');
  form.addParagraphTextItem().setTitle('Quick note')
    .setHelpText('e.g. waiting on client to confirm design').setRequired(true);

  // --- Page 12: Support ---
  var pbSupport = form.addPageBreakItem().setTitle('Support');
  var support = form.addMultipleChoiceItem().setTitle('Do you need help from someone else today?').setRequired(true);

  clientItem.setChoices([
    clientItem.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    clientItem.createChoice('No', pbSupport)
  ]);

  // --- Page 13: Support detail (only if Support != No) ---
  form.addPageBreakItem().setTitle('Support — Detail');
  var supportWho = form.addListItem().setTitle('Who can help with this?')
    .setChoiceValues(supportWhoFor_(profile)).setRequired(true);
  props.setProperty('ITEM_SUPPORTWHO_' + profile.key, String(supportWho.getId()));
  form.addParagraphTextItem().setTitle('What do you need?').setHelpText('e.g. Rahul on site by 2pm').setRequired(true);

  support.setChoices([
    support.createChoice('No', FormApp.PageNavigationType.SUBMIT),
    support.createChoice('Yes-Urgent', FormApp.PageNavigationType.CONTINUE),
    support.createChoice('Yes-Can wait', FormApp.PageNavigationType.CONTINUE)
  ]);

  props.setProperty('FORM_' + profile.key + '_ID', String(form.getId()));
  return form;
}

function buildLeadGenForm_(ss) {
  var props = PropertiesService.getScriptProperties();
  var form = FormApp.create('Lead Generation');
  var beforeNames = ss.getSheets().map(function (s) { return s.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  renameNewResponseSheet_(ss, beforeNames, SHEET_LEAD_RESPONSES);
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
