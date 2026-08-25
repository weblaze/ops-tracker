/**
 * Shared constants used across Setup.gs, Triggers.gs, Dashboard.gs, Menu.gs.
 * Keeping these in one place avoids the choice-value strings drifting between
 * the form builder and the code that reads submitted values back out.
 */

var SS_NAME = 'Ops Tracker';

var SHEET_EMPLOYEES = 'Employees';
var SHEET_PROJECTS = 'Projects';
var SHEET_FLAGS = 'Flags';
var SHEET_DASHBOARD = 'Dashboard';
var SHEET_DAILY_RESPONSES = 'DailyUpdate_Responses';
var SHEET_LEAD_RESPONSES = 'LeadGen_Responses';

var YESTERDAY_STATUS = ['Completed', 'Partial', 'Not Started'];
var YES_NO = ['Yes', 'No'];
var BLOCKED_REASONS = ['Material', 'Drawing', 'Client Decision', 'Payment', 'Labour', 'Site Not Ready', 'Other Dept', 'Other'];
var SUPPORT_STATUS = ['No', 'Yes-Urgent', 'Yes-Can wait'];
var SUPPORT_WHO = ['Prashant', 'Rajeev', 'Design', 'Purchase', 'Site', 'Accounts', 'Client', 'Vendor'];

// Not specified exactly in the brief — sensible defaults, easy to edit here.
var LEAD_SOURCES = ['Referral', 'Website', 'Cold Call', 'Exhibition', 'Social Media', 'Walk-in', 'Other'];
var REQUIREMENTS = ['IVF Lab', 'Modular', 'HVAC', 'Interior', 'Turnkey', 'Other'];
var PRIORITIES = ['Hot', 'Warm', 'Cold'];
var STAGES = ['New', 'Site Visit', 'Quotation', 'Negotiation', 'Won', 'Lost', 'Hold'];

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
