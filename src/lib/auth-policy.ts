export const TEACHER_EMAIL = "leiqi19791120@gmail.com";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isTeacherEmail(email: string) {
  return normalizeEmail(email) === TEACHER_EMAIL;
}
