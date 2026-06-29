/**
 * Signing-fee service.
 *
 * A studio pays a one-time signing fee whenever it hires talent (actor,
 * writer, director, or crew team). The fee is a fixed multiple of the
 * talent's WEEKLY salary, so it scales automatically with talent quality:
 * `salary` already factors in rarity, skill, popularity, and fanbase in every
 * talent generator, which is why a separate rarity multiplier here would
 * double-count rarity.
 *
 * The fee is always derived server-side from the stored talent record, so it
 * cannot be tampered with or bypassed by the client.
 */

// One-time signing fee, expressed as a number of weeks of salary.
export const SIGNING_FEE_WEEKS = 4;

// Fallback used only when a talent record has no usable salary, so that hiring
// can never be silently free.
const FALLBACK_SIGNING_FEE = 50000;

/**
 * Calculate the signing fee for a talent record.
 *
 * @param {{ salary?: number }} talent - actor, writer, director, or crew team
 * @returns {number} signing fee in studio currency (rounded, >= 0)
 */
export const calculateSigningFee = (talent = {}) => {
  const weeklySalary = Number(talent?.salary);
  if (!Number.isFinite(weeklySalary) || weeklySalary <= 0) {
    return FALLBACK_SIGNING_FEE;
  }
  return Math.round(weeklySalary * SIGNING_FEE_WEEKS);
};
