function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Ops Tools')
    .addItem('Sync Dropdowns Now', 'syncDropdowns')
    .addToUi();
}

/**
 * Rewrites every form dropdown sourced from the Employees/Projects tabs.
 * Runs automatically on edits to those tabs and via the manual menu item.
 */
function syncDropdowns() {
  var props = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.openById(props.getProperty('SS_ID'));
  var leadForm = FormApp.openById(props.getProperty('LEAD_FORM_ID'));

  var empRows = ss.getSheetByName(SHEET_EMPLOYEES).getDataRange().getValues().slice(1).filter(function (r) {
    return r[0];
  });
  var allNames = empRows.map(function (r) {
    return r[0];
  });
  var allDepts = uniq_(DEPARTMENT_PROFILES.map(function (p) {
    return p.name;
  }));

  var projRows = ss.getSheetByName(SHEET_PROJECTS).getDataRange().getValues().slice(1).filter(function (r) {
    return r[0] && String(r[1]).indexOf('Active') === 0;
  });
  var activeProjects = projRows.map(function (r) {
    return r[0];
  });

  DEPARTMENT_PROFILES.forEach(function (profile) {
    var form = FormApp.openById(props.getProperty('FORM_' + profile.key + '_ID'));
    var namesForDept = empRows.filter(function (r) {
      return r[1] === profile.name;
    }).map(function (r) {
      return r[0];
    });
    var otherDepts = allDepts.filter(function (d) {
      return d !== profile.name;
    });
    var supportWho = allNames.filter(function (n) {
      return n !== profile.person;
    }).concat(['Client', 'Vendor']);

    form.getItemById(Number(props.getProperty('ITEM_NAME_' + profile.key))).asListItem().setChoiceValues(namesForDept);
    form.getItemById(Number(props.getProperty('ITEM_PROJECT_' + profile.key))).asListItem().setChoiceValues(activeProjects);
    form.getItemById(Number(props.getProperty('ITEM_ALSOPROJECTS_' + profile.key))).asCheckboxItem().setChoiceValues(activeProjects);
    form.getItemById(Number(props.getProperty('ITEM_TAGDEPT_' + profile.key))).asListItem().setChoiceValues(otherDepts);
    form.getItemById(Number(props.getProperty('ITEM_SUPPORTWHO_' + profile.key))).asListItem().setChoiceValues(supportWho);
  });

  leadForm.getItemById(Number(props.getProperty('ITEM_CAPTUREDBY_ID'))).asListItem().setChoiceValues(allNames);
  leadForm.getItemById(Number(props.getProperty('ITEM_ASSIGNEDTO_ID'))).asListItem().setChoiceValues(allNames);
}
