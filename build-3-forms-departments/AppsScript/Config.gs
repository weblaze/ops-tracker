/**
 * Shared constants used across Setup.gs, Triggers.gs, Dashboard.gs, Menu.gs.
 *
 * This is the "4 isolated departments" variant: instead of one Daily
 * Update form with a Department picker, each department gets its own form,
 * worded around that department's real work. All 4 (plus Lead Generation)
 * still write into one shared spreadsheet so the manager dashboard doesn't
 * fragment across 4 files.
 */

var SS_NAME = 'Ops Tracker — 4 Departments';

var SHEET_EMPLOYEES = 'Employees';
var SHEET_PROJECTS = 'Projects';
var SHEET_FLAGS = 'Flags';
var SHEET_DASHBOARD = 'Dashboard';
var SHEET_LEAD_RESPONSES = 'LeadGen_Responses';

var YESTERDAY_STATUS = ['Completed', 'Partial', 'Not Started'];
var BLOCKED_REASONS = ['Material', 'Drawing', 'Client Decision', 'Payment', 'Labour', 'Site Not Ready', 'Other Dept', 'Other'];
var SUPPORT_STATUS = ['No', 'Yes-Urgent', 'Yes-Can wait'];
var SUPPORT_WHO_ALL = ['Amit', 'Anil', 'Rahul', 'Subrat', 'Client', 'Vendor'];

var LEAD_SOURCES = ['Referral', 'Website', 'Cold Call', 'Exhibition', 'Social Media', 'Walk-in', 'Other'];
var REQUIREMENTS = ['IVF Lab', 'Modular', 'HVAC', 'Interior', 'Turnkey', 'Other'];
var PRIORITIES = ['Hot', 'Warm', 'Cold'];
var STAGES = ['New', 'Site Visit', 'Quotation', 'Negotiation', 'Won', 'Lost', 'Hold'];

/**
 * One entry per department. `person` is who to exclude from that
 * department's own "who can help" list (no point asking yourself for
 * help). Wording below reflects each person's real KRAs.
 */
var DEPARTMENT_PROFILES = [
  {
    key: 'execution',
    name: 'Execution',
    person: 'Rahul',
    formTitle: 'Execution — Daily Update',
    sheetName: 'Execution_Responses',
    todayHint: 'e.g. install AHU unit at Site X, fix control panel wiring',
    blockedHint: 'e.g. AHU part missing, site not ready for installation',
    paymentQuestion: 'Is a pending payment slowing down material or vendor work?',
    paymentHint: "e.g. vendor won't deliver AHU parts until paid",
    clientQuestion: 'Are you waiting on the client for an on-site decision?',
    clientHint: 'e.g. access, placement approval'
  },
  {
    key: 'design',
    name: 'Design',
    person: 'Subrat',
    formTitle: 'Design — Daily Update',
    sheetName: 'Design_Responses',
    todayHint: 'e.g. finish 2D layout for Site Y, submit drawing to client',
    blockedHint: "e.g. waiting on site measurements, client hasn't approved layout",
    paymentQuestion: 'Is a pending payment slowing this down?',
    paymentHint: 'e.g. design fee not cleared',
    clientQuestion: 'Are you waiting on the client or team head to approve a drawing?',
    clientHint: 'e.g. layout sign-off'
  },
  {
    key: 'purchase',
    name: 'Purchase',
    person: 'Anil',
    formTitle: 'Purchase — Daily Update',
    sheetName: 'Purchase_Responses',
    todayHint: 'e.g. order cement for Site Z, follow up on delayed delivery',
    blockedHint: 'e.g. vendor delay, site not ready to receive material',
    paymentQuestion: 'Is a pending payment holding up an order or delivery?',
    paymentHint: 'e.g. vendor needs advance before shipping',
    clientQuestion: 'Are you waiting on the client to decide something?',
    clientHint: 'e.g. material brand or spec choice'
  },
  {
    key: 'coordination',
    name: 'Coordination',
    person: 'Amit',
    formTitle: 'Coordination — Daily Update',
    sheetName: 'Coordination_Responses',
    todayHint: 'e.g. client call for Project X, prepare handover documents',
    blockedHint: 'e.g. waiting on site report, client unavailable',
    paymentQuestion: 'Is a pending payment affecting this?',
    paymentHint: "e.g. client hasn't cleared invoice",
    clientQuestion: 'Are you waiting on the client to decide something?',
    clientHint: ''
  }
];

function uniq_(arr) {
  var seen = {};
  var out = [];
  arr.forEach(function (v) {
    if (v && !seen[v]) {
      seen[v] = true;
      out.push(v);
    }
  });
  return out;
}

function pad3_(n) {
  var s = String(n);
  return s.length < 3 ? ('000' + s).slice(-3) : s;
}

function renameNewestSheet_(ss, name) {
  var sheets = ss.getSheets();
  sheets[sheets.length - 1].setName(name);
}

function supportWhoFor_(deptProfile) {
  return SUPPORT_WHO_ALL.filter(function (name) {
    return name !== deptProfile.person;
  });
}
