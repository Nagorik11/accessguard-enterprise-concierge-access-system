/**
 * Chilean RUT validation (Modulo 11)
 * Technical Contract: Ensures only valid identification enters the system.
 * Shared between Frontend and Backend.
 */
export function cleanRut(rut: string): string {
  return typeof rut === 'string' ? rut.replace(/[^0-9kK]/g, '') : '';
}
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;
  const dv = cleaned.slice(-1).toUpperCase();
  const body = cleaned.slice(0, -1);
  let result = '';
  let j = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    result = body.charAt(i) + (j > 0 && j % 3 === 0 ? '.' : '') + result;
    j++;
  }
  return `${result}-${dv}`;
}
export function isValidRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  const dv = cleaned.slice(-1).toLowerCase();
  const body = cleaned.slice(0, -1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDv = 11 - (sum % 11);
  let dvChar = '';
  if (expectedDv === 11) dvChar = '0';
  else if (expectedDv === 10) dvChar = 'k';
  else dvChar = expectedDv.toString();
  return dvChar === dv;
}