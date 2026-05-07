import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Calcula el dígito verificador de un RUT chileno.
 * @param body - Parte numérica del RUT sin dígito verificador
 */
function calcularDV(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/**
 * Valida que el control contenga un RUT chileno válido.
 * Acepta formatos: 12345678-9 · 12.345.678-9 · 123456789
 */
export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value ?? '').toString().trim();
    if (!value) return null; // campo vacío: deja que required lo maneje

    // Limpiar puntos y guión
    const clean = value.replace(/\./g, '').replace(/-/g, '');
    if (clean.length < 2) return { rutInvalido: true };

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return { rutInvalido: true };
    if (Number(body) < 100_000) return { rutInvalido: true }; // RUT mínimo razonable

    return calcularDV(body) === dv ? null : { rutInvalido: true };
  };
}

/**
 * Formatea un RUT al estilo XX.XXX.XXX-X mientras el usuario escribe.
 * Devuelve la cadena formateada (sin modificar si está vacía).
 */
export function formatRut(value: string): string {
  // Dejar solo dígitos y K
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  let body = clean.slice(0, -1);

  // Insertar puntos cada 3 dígitos desde la derecha
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${body}-${dv}`;
}
