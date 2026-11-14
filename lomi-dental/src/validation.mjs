export function todayInAddis(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function validateRequest(data, services, today = todayInAddis()) {
  const errors = {};
  if (String(data.name || "").trim().length < 2) errors.name = "invalidName";
  const phone = String(data.phone || "").replace(/[\s()-]/g, "");
  if (!/^(?:\+251|0)[79]\d{8}$/.test(phone)) errors.phone = "invalidPhone";
  if (!["unsure", ...services].includes(data.service)) errors.service = "invalidService";
  const date = new Date(`${data.date}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date || "") ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== data.date ||
    data.date <= today ||
    date.getUTCDay() === 0
  )
    errors.date = "invalidDate";
  if (!["morning", "afternoon"].includes(data.time)) errors.time = "invalidTime";
  if (!data.consent) errors.consent = "invalidConsent";
  if (String(data.message || "").length > 500) errors.message = "tooLong";
  return errors;
}
