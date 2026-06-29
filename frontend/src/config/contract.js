// Standard talent contract length used across the studio, in weeks.
//
// This mirrors the production cost model in the backend (movieController.js),
// where talent is paid for the full production cycle:
//   4 weeks pre-production + 10 weeks production + 6 weeks post-production = 20.
// Keeping a single constant here means the marketplace "Total Salary" figure
// matches what a studio is actually charged when the talent is put on a film.
export const STANDARD_CONTRACT_WEEKS = 20;

// Total salary paid to a talent over a contract of `weeks` weeks.
// Pure function of its inputs, so any view that passes a specific duration
// (e.g. a film's remaining production weeks) gets a total that updates with it.
export const getTotalSalary = (weeklySalary, weeks = STANDARD_CONTRACT_WEEKS) =>
  Number(weeklySalary || 0) * Number(weeks || 0);
