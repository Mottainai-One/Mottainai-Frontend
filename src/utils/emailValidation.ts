const EMAIL_PATTERN = /^[^\s@]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i;

export function isValidEmailAddress(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}
