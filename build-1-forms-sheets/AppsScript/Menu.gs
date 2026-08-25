function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Ops Tools')
    .addItem('Sync Dropdowns Now', 'syncDropdowns')
    .addToUi();
}

/**
 * Rewrites the form dropdowns that are sourced from the Employees/Projects
 * tabs. Runs automatically on edits to those tabs (see onMasterTabEdit in
 * Triggers.gs) and is also exposed as a manual menu item for instant effect.
 */
function syncDropdowns() {
  var props = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.openById(props.getProperty('SS_ID'));
  var dailyForm = FormApp.openById(props.getProperty('DAILY_FORM_ID'));
  var leadForm = FormApp.openById(props.getProperty('LEAD_FORM_ID'));

  var empRows = ss.getSheetByName(SHEET_EMPLOYEES).getDataRange().getValues().slice(1).filter(function (r) {
    return r[0];
  });
  var nameDept = empRows.map(function (r) {
    return r[0] + ' — ' + r[1];
  });
  var depts = uniq_(empRows.map(function (r) {
    return r[1];
  }));
  var names = empRows.map(function (r) {
    return r[0];
  });

  var projRows = ss.getSheetByName(SHEET_PROJECTS).getDataRange().getValues().slice(1).filter(function (r) {
    return r[0] && String(r[1]).indexOf('Active') === 0;
  });
  var activeProjects = projRows.map(function (r) {
    return r[0];
  });

  dailyForm.getItemById(Number(props.getProperty('ITEM_NAMEDEPT_ID'))).asListItem().setChoiceValues(nameDept);
  dailyForm.getItemById(Number(props.getProperty('ITEM_PROJECT_ID'))).asListItem().setChoiceValues(activeProjects);
  dailyForm.getItemById(Number(props.getProperty('ITEM_TAGDEPT_ID'))).asListItem().setChoiceValues(depts);

  leadForm.getItemById(Number(props.getProperty('ITEM_CAPTUREDBY_ID'))).asListItem().setChoiceValues(names);
  leadForm.getItemById(Number(props.getProperty('ITEM_ASSIGNEDTO_ID'))).asListItem().setChoiceValues(names);
}
