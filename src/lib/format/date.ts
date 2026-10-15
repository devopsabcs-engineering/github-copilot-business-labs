const OPTIONS_DATE: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
  timeZone: "America/Toronto",
};

const OPTIONS_DATE_HEURE: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Toronto",
};

export function formaterDateLongue(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-CA", OPTIONS_DATE).format(new Date(date));
}

export function formaterDateHeure(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-CA", OPTIONS_DATE_HEURE).format(
    new Date(date),
  );
}