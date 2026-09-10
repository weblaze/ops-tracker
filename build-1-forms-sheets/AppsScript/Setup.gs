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
  syncDropdowns();

  // Google Forms creates each form's response sheet with a short, variable
  // delay that isn't reliably observable within this same execution (we
  // tried waiting — even 20+ seconds of polling isn't consistently enough).
  // finishSetup() runs itself a minute from now, in a fresh execution that
  // will see current state, and renames those sheets then.
  clearFinishSetupTriggers_();
  ScriptApp.newTrigger('finishSetup').timeBased().after(60 * 1000).create();

  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Daily Update form (share this link): ' + dailyForm.getPublishedUrl());
  Logger.log('Lead Generation form (share this link): ' + leadForm.getPublishedUrl());
  Logger.log('Finishing up in the background — wait about a minute before ' +
    'submitting a test response (check View > Executions for a "finishSetup" ' +
    'entry to confirm). A response submitted before that finishes would still ' +
    'save, but the Dashboard/Flags logic wouldn\'t pick it up.');
}

function seedMasterTabs_(ss) {
  var emp = ss.insertSheet(SHEET_EMPLOYEES);
  emp.getRange(1, 1, 1, 3).setValues([['Name', 'Department', 'Name — Department (auto, do not edit)']]);
  var placeholderEmployees = [
    ['Amit', 'Coordination'],
    ['Anil', 'Purchase'],
    ['Rahul', 'Execution'],
    ['Subrat', 'Design']
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
  var nameDeptItem = form.addListItem().setTitle('Who\'s filling this out?').setRequired(true);
  props.setProperty('ITEM_NAMEDEPT_ID', String(nameDeptItem.getId()));

  var projectItem = form.addListItem().setTitle('Which project is this mainly about today?').setRequired(true);
  props.setProperty('ITEM_PROJECT_ID', String(projectItem.getId()));

  var alsoProjectsItem = form.addCheckboxItem()
    .setTitle('Any other projects you also touched today?')
    .setHelpText('Optional — just a quick tag, no extra detail needed.');
  props.setProperty('ITEM_ALSOPROJECTS_ID', String(alsoProjectsItem.getId()));

  // --- Page 2: Yesterday ---
  form.addPageBreakItem().setTitle('Yesterday');
  var yesterdayStatus = form.addMultipleChoiceItem().setTitle('How did yesterday\'s work go?').setRequired(true);

  // --- Page 3: Yesterday detail (only if Partial / Not Started) ---
  form.addPageBreakItem().setTitle('Yesterday — What');
  form.addParagraphTextItem().setTitle('What\'s left from yesterday?')
    .setHelpText('e.g. wiring not finished, waiting on materials').setRequired(true);

  // --- Page 4: Today ---
  var pbTodayReal = form.addPageBreakItem().setTitle('Today');
  form.addParagraphTextItem().setTitle('What will you get done today?')
    .setHelpText('e.g. install AHU filter, submit drawing to client').setRequired(true);

  yesterdayStatus.setChoices([
    yesterdayStatus.createChoice('Completed', pbTodayReal),
    yesterdayStatus.createChoice('Partial', FormApp.PageNavigationType.CONTINUE),
    yesterdayStatus.createChoice('Not Started', FormApp.PageNavigationType.CONTINUE)
  ]);

  // --- Page 5: Blocked ---
  form.addPageBreakItem().setTitle('Blocked');
  var blocked = form.addMultipleChoiceItem()
    .setTitle('Is anything stopping you from finishing your work?')
    .setHelpText('e.g. missing material, no drawing approval yet').setRequired(true);

  // --- Page 6: Reason (only if Blocked = Yes) ---
  form.addPageBreakItem().setTitle('Blocked — Reason');
  var reason = form.addListItem().setTitle('What\'s the reason?').setChoiceValues(BLOCKED_REASONS).setRequired(true);

  // --- Page 7: Tag Department (only if Reason = Other Dept) ---
  form.addPageBreakItem().setTitle('Tag Department');
  var tagDept = form.addListItem().setTitle('Which team is holding this up?').setRequired(true);
  props.setProperty('ITEM_TAGDEPT_ID', String(tagDept.getId()));

  // --- Page 8: Payment ---
  var pbPayment = form.addPageBreakItem().setTitle('Payment');
  var payment = form.addMultipleChoiceItem()
    .setTitle('Is a pending payment slowing this down?')
    .setHelpText('e.g. vendor won\'t deliver until paid').setRequired(true);

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
    .setHelpText('e.g. vendor invoice unpaid, client hasn\'t released advance').setRequired(true);

  // --- Page 10: Client ---
  var pbClient = form.addPageBreakItem().setTitle('Client');
  var client = form.addMultipleChoiceItem()
    .setTitle('Are you waiting on the client to decide something?')
    .setHelpText('e.g. tile color, layout approval').setRequired(true);

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

  client.setChoices([
    client.createChoice('Yes', FormApp.PageNavigationType.CONTINUE),
    client.createChoice('No', pbSupport)
  ]);

  // --- Page 13: Support detail (only if Support != No) ---
  form.addPageBreakItem().setTitle('Support — Detail');
  var supportWho = form.addListItem().setTitle('Who can help with this?').setChoiceValues(SUPPORT_WHO).setRequired(true);
  form.addParagraphTextItem().setTitle('What do you need?').setHelpText('e.g. Rahul on site by 2pm').setRequired(true);

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

/**
 * Renames each form's auto-created response sheet to the fixed names the
 * rest of the code expects (SHEET_DAILY_RESPONSES / SHEET_LEAD_RESPONSES).
 * Runs on its own ~1 minute after setupAll() via a temporary trigger — see
 * the comment in setupAll() for why this isn't done inline. Safe to also
 * run manually from the function dropdown if you don't want to wait, or
 * if it needs another attempt.
 */
function finishSetup() {
  var props = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.openById(props.getProperty('SS_ID'));

  var pending = [SHEET_DAILY_RESPONSES, SHEET_LEAD_RESPONSES].filter(function (targetName) {
    return !ss.getSheetByName(targetName);
  });

  if (pending.length === 0) {
    finishSetupComplete_();
    return;
  }

  var known = [SHEET_EMPLOYEES, SHEET_PROJECTS, SHEET_FLAGS, SHEET_DASHBOARD, SHEET_DAILY_RESPONSES, SHEET_LEAD_RESPONSES];
  var unclaimed = ss.getSheets().filter(function (s) {
    return known.indexOf(s.getName()) === -1;
  });

  if (unclaimed.length < pending.length) {
    var attempts = Number(props.getProperty('FINISH_SETUP_ATTEMPTS') || '0') + 1;
    props.setProperty('FINISH_SETUP_ATTEMPTS', String(attempts));
    if (attempts >= 6) {
      Logger.log('Still missing ' + pending.join(', ') + ' after ' + attempts +
        ' attempts (about 6 minutes) — run finishSetup() manually to try again.');
      clearFinishSetupTriggers_();
      return;
    }
    Logger.log('Found ' + unclaimed.length + ' of ' + pending.length +
      ' pending response sheet(s) so far — retrying in 1 minute (attempt ' + attempts + ' of 6).');
    clearFinishSetupTriggers_();
    ScriptApp.newTrigger('finishSetup').timeBased().after(60 * 1000).create();
    return;
  }

  // Both forms were built in this order (Daily Update, then Lead
  // Generation), and sheets appear in creation order, so pairing the
  // still-unnamed sheets up positionally against `pending` is reliable
  // here — unlike trying to do this within setupAll()'s own execution.
  unclaimed.slice(0, pending.length).forEach(function (sheet, i) {
    sheet.setName(pending[i]);
  });

  finishSetupComplete_();
}

function finishSetupComplete_() {
  PropertiesService.getScriptProperties().deleteProperty('FINISH_SETUP_ATTEMPTS');
  clearFinishSetupTriggers_();
  syncDropdowns();
  Logger.log('Setup finished — response sheets are named correctly and dropdowns are synced. Ready to use.');
}

function clearFinishSetupTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'finishSetup') ScriptApp.deleteTrigger(t);
  });
}
