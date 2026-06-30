export const ENFORCEMENT_URL = "https://api.fda.gov/drug/enforcement.json";

export const CLASSIFICATION_OPTIONS = [
  { value: "all", label: "All classifications" },
  { value: "Class I", label: "Class I — most serious" },
  { value: "Class II", label: "Class II — moderate" },
  { value: "Class III", label: "Class III — minor" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Terminated", label: "Terminated" },
  { value: "Completed", label: "Completed" },
];

// FDA recall severity classification, worst to least severe.
// https://open.fda.gov/apis/drug/enforcement/
export const CLASSIFICATION_COLORS = {
  "Class I": "var(--m-danger)",
  "Class II": "var(--m-warning)",
  "Class III": "var(--m-info)",
};

export const STATUS_BADGE_CLASS = {
  Ongoing: "dr-badge-warning",
  Terminated: "dr-badge-success",
  Completed: "dr-badge-info",
};
