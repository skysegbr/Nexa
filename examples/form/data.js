export const contactInitialValues = {
  name: "",
  email: "",
  role: "",
  notes: "",
  newsletter: true,
};

export const roleOptions = [
  { value: "", label: "Choose a role", disabled: true },
  { value: "designer",   label: "Designer" },
  { value: "developer",  label: "Developer" },
  { value: "manager",    label: "Project manager" },
];

export function validateContactValues(values) {
  return {
    name:  values.name.trim()               ? "" : "Name is required.",
    email: values.email.includes("@")        ? "" : "Please enter a valid email.",
    role:  values.role                       ? "" : "Please choose a role.",
    notes: values.notes.trim().length >= 12  ? "" : "Write at least 12 characters.",
  };
}
