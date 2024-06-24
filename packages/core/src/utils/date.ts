export const getDateSecondsFromNow = (seconds: number) =>
  new Date(Date.now() + seconds * 1000);

export const getDateHoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

export const getDateDaysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const getDateYearsFromNow = (years: number) =>
  new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000);
