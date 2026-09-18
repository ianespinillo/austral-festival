export const LEGAL_AGE = 18;

export function ageAsOf(birthDate: Date, at: Date): number {
  let age = at.getFullYear() - birthDate.getFullYear();
  const monthDiff = at.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function isLegalAge(birthDate: Date, at: Date): boolean {
  return ageAsOf(birthDate, at) >= LEGAL_AGE;
}