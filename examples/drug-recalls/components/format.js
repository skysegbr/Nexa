// openFDA dates arrive as bare "YYYYMMDD" strings.
export function formatFdaDate(value) {
  if (!value || value.length !== 8) return "—";
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
