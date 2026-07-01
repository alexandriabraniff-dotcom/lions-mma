import type { DisciplineId } from './disciplines';
import type { LocationId } from './locations';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * beginner       = Beginner / White Belt
 * intermediate   = Intermediate–Advanced
 * all            = All Levels
 * womens         = Women's Only
 * kids           = Junior class (ages listed in note)
 * teens          = Teen class (12+)
 * competition    = Competition team
 */
export type Level =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'competition'
  | 'kids'
  | 'teens'
  | 'womens';

export type ClassSession = {
  day: Day;
  start: string;  // 24h, e.g. '18:00'
  end: string;    // 24h, e.g. '19:00'
  discipline: DisciplineId;
  location: LocationId;
  level?: Level;
  coach?: string;
  note?: string;  // e.g. 'Drills & Sparring', '4–7 yrs', '8–12 yrs'
};

// ─── Day labels and order ────────────────────────────────────────────────────

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const DAYS_ORDER: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// ─── Schedule ────────────────────────────────────────────────────────────────
//
// Source: lionsmma.ca/schedule (via bjjrestart.vercel.app/schedule)
// Last updated: July 2026
//
// HOW TO EDIT:
//   Add a class    → add one object to the array below
//   Remove a class → delete the line
//   Change time    → edit start/end (24h format: '06:30', '13:00', '19:35')
//   Change level   → edit level field (see type above)
//   Add a note     → add note: 'text' for age ranges, Drills & Sparring etc.
//
// TypeScript will fail at build time if you use an invalid discipline or location id.

export const schedule: ClassSession[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // MONDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Monday
  { day: 'mon', start: '06:30', end: '07:30', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'mon', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'womens' },
  { day: 'mon', start: '11:00', end: '12:00', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },
  { day: 'mon', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'mon', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'mon', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Pankration · 8–12 yrs' },
  { day: 'mon', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'teens', note: 'Teens Striking · 12+ yrs' },
  { day: 'mon', start: '17:15', end: '18:15', discipline: 'boxing',       location: '1256', level: 'beginner' },
  { day: 'mon', start: '17:15', end: '18:15', discipline: 'boxing',       location: '1256', level: 'intermediate' },
  { day: 'mon', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'mon', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'mon', start: '19:35', end: '20:35', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'mon', start: '19:35', end: '20:35', discipline: 'muay-thai',    location: '1256', level: 'beginner',      note: 'Drills & Sparring' },
  { day: 'mon', start: '19:35', end: '21:00', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },

  // 1133 Granville — Monday
  { day: 'mon', start: '12:00', end: '13:15', discipline: 'nogi',         location: '1133', level: 'intermediate' },
  { day: 'mon', start: '13:30', end: '14:30', discipline: 'nogi',         location: '1133', level: 'beginner' },
  { day: 'mon', start: '16:00', end: '17:00', discipline: 'kids',         location: '1133', level: 'kids', note: 'Jr Lions BJJ · 6+ yrs' },
  { day: 'mon', start: '17:15', end: '18:15', discipline: 'nogi',         location: '1133', level: 'beginner' },
  { day: 'mon', start: '18:30', end: '20:30', discipline: 'nogi',         location: '1133', level: 'intermediate' },

  // ─────────────────────────────────────────────────────────────────────────
  // TUESDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Tuesday
  { day: 'tue', start: '06:30', end: '07:30', discipline: 'nogi',         location: '1256', level: 'all' },
  { day: 'tue', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'tue', start: '11:00', end: '12:00', discipline: 'boxing',       location: '1256', level: 'beginner' },
  { day: 'tue', start: '11:00', end: '12:00', discipline: 'boxing',       location: '1256', level: 'intermediate' },
  { day: 'tue', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'tue', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'tue', start: '16:00', end: '16:50', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Martial Arts · 4–7 yrs' },
  { day: 'tue', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'teens', note: 'Teens Striking · 12+ yrs' },
  { day: 'tue', start: '17:15', end: '18:15', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'tue', start: '17:15', end: '18:15', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'tue', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'tue', start: '18:25', end: '19:25', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },
  { day: 'tue', start: '19:35', end: '20:35', discipline: 'nogi',         location: '1256', level: 'beginner' },
  { day: 'tue', start: '19:35', end: '21:00', discipline: 'nogi',         location: '1256', level: 'intermediate' },

  // 1133 Granville — Tuesday
  { day: 'tue', start: '12:00', end: '13:15', discipline: 'bjj-gi',       location: '1133', level: 'intermediate' },
  { day: 'tue', start: '13:30', end: '14:30', discipline: 'bjj-gi',       location: '1133', level: 'beginner' },
  { day: 'tue', start: '16:00', end: '17:00', discipline: 'kids',         location: '1133', level: 'kids', note: 'Jr Lions BJJ · 6+ yrs' },
  { day: 'tue', start: '17:15', end: '18:15', discipline: 'bjj-gi',       location: '1133', level: 'beginner' },
  { day: 'tue', start: '18:25', end: '19:25', discipline: 'bjj-gi',       location: '1133', level: 'intermediate' },

  // ─────────────────────────────────────────────────────────────────────────
  // WEDNESDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Wednesday
  { day: 'wed', start: '06:30', end: '07:30', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'wed', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'womens' },
  { day: 'wed', start: '11:00', end: '12:00', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },
  { day: 'wed', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'wed', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'wed', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Pankration · 8–12 yrs' },
  { day: 'wed', start: '17:15', end: '18:15', discipline: 'boxing',       location: '1256', level: 'beginner' },
  { day: 'wed', start: '17:15', end: '18:15', discipline: 'boxing',       location: '1256', level: 'intermediate' },
  { day: 'wed', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'wed', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'wed', start: '19:35', end: '20:35', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'wed', start: '19:35', end: '20:35', discipline: 'muay-thai',    location: '1256', level: 'beginner',      note: 'Drills & Sparring' },
  { day: 'wed', start: '19:35', end: '21:00', discipline: 'mma',          location: '1256', level: 'intermediate' },

  // 1133 Granville — Wednesday
  { day: 'wed', start: '12:00', end: '13:15', discipline: 'nogi',         location: '1133', level: 'intermediate' },
  { day: 'wed', start: '13:30', end: '14:30', discipline: 'nogi',         location: '1133', level: 'beginner' },
  { day: 'wed', start: '16:00', end: '17:00', discipline: 'kids',         location: '1133', level: 'teens', note: 'Teens No-Gi · 12+ yrs' },
  { day: 'wed', start: '17:15', end: '18:15', discipline: 'nogi',         location: '1133', level: 'womens' },
  { day: 'wed', start: '18:30', end: '20:30', discipline: 'nogi',         location: '1133', level: 'intermediate' },

  // ─────────────────────────────────────────────────────────────────────────
  // THURSDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Thursday
  { day: 'thu', start: '06:30', end: '07:30', discipline: 'nogi',         location: '1256', level: 'all' },
  { day: 'thu', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'thu', start: '11:00', end: '12:00', discipline: 'boxing',       location: '1256', level: 'beginner' },
  { day: 'thu', start: '11:00', end: '12:00', discipline: 'boxing',       location: '1256', level: 'intermediate' },
  { day: 'thu', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'thu', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'thu', start: '16:00', end: '16:50', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Martial Arts · 4–7 yrs' },
  { day: 'thu', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'teens', note: 'Teens Striking · 12+ yrs' },
  { day: 'thu', start: '17:15', end: '18:15', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'thu', start: '17:15', end: '18:15', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'thu', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'thu', start: '18:25', end: '19:25', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },
  { day: 'thu', start: '19:35', end: '20:35', discipline: 'nogi',         location: '1256', level: 'beginner' },
  { day: 'thu', start: '19:35', end: '21:00', discipline: 'nogi',         location: '1256', level: 'intermediate' },

  // 1133 Granville — Thursday
  { day: 'thu', start: '12:00', end: '13:15', discipline: 'bjj-gi',       location: '1133', level: 'intermediate' },
  { day: 'thu', start: '13:30', end: '14:30', discipline: 'bjj-gi',       location: '1133', level: 'beginner' },
  { day: 'thu', start: '16:00', end: '17:00', discipline: 'kids',         location: '1133', level: 'kids', note: 'Jr Lions BJJ · 6+ yrs' },
  { day: 'thu', start: '17:15', end: '18:15', discipline: 'bjj-gi',       location: '1133', level: 'beginner' },
  { day: 'thu', start: '18:25', end: '19:25', discipline: 'bjj-gi',       location: '1133', level: 'intermediate' },

  // ─────────────────────────────────────────────────────────────────────────
  // FRIDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Friday
  { day: 'fri', start: '06:30', end: '07:30', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'fri', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'womens' },
  { day: 'fri', start: '11:00', end: '12:00', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },
  { day: 'fri', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'fri', start: '12:00', end: '13:00', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'fri', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Pankration · 8–12 yrs' },
  { day: 'fri', start: '16:00', end: '17:00', discipline: 'kids',         location: '1256', level: 'teens', note: 'Teens Striking · 12+ yrs' },
  { day: 'fri', start: '17:15', end: '18:15', discipline: 'muay-thai',    location: '1256', level: 'womens' },
  { day: 'fri', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'fri', start: '18:25', end: '19:25', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'fri', start: '19:35', end: '20:35', discipline: 'muay-thai',    location: '1256', level: 'beginner', note: 'Drills & Sparring' },
  { day: 'fri', start: '19:35', end: '21:00', discipline: 'dutch',        location: '1256', level: 'intermediate', note: 'Drills & Sparring' },

  // 1133 Granville — Friday
  { day: 'fri', start: '12:00', end: '13:15', discipline: 'nogi',         location: '1133', level: 'intermediate' },
  { day: 'fri', start: '13:30', end: '14:30', discipline: 'nogi',         location: '1133', level: 'beginner' },
  { day: 'fri', start: '16:00', end: '17:00', discipline: 'kids',         location: '1133', level: 'teens', note: 'Teens No-Gi · 12+ yrs' },
  { day: 'fri', start: '17:15', end: '18:15', discipline: 'nogi',         location: '1133', level: 'beginner' },
  { day: 'fri', start: '18:30', end: '20:30', discipline: 'nogi',         location: '1133', level: 'intermediate' },

  // ─────────────────────────────────────────────────────────────────────────
  // SATURDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Saturday
  { day: 'sat', start: '09:00', end: '10:00', discipline: 'muay-thai',    location: '1256', level: 'all' },
  { day: 'sat', start: '10:00', end: '11:00', discipline: 'muay-thai',    location: '1256', level: 'womens' },
  { day: 'sat', start: '11:15', end: '12:15', discipline: 'boxing',       location: '1256', level: 'all' },
  { day: 'sat', start: '12:30', end: '13:30', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'sat', start: '12:30', end: '13:30', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },
  { day: 'sat', start: '13:45', end: '15:00', discipline: 'dutch',        location: '1256', level: 'all', note: 'Drills & Sparring' },

  // 1256 Granville — Saturday morning (confirmed at HQ per schedule footnote)
  { day: 'sat', start: '09:00', end: '10:00', discipline: 'conditioning', location: '1256', level: 'all' },
  { day: 'sat', start: '10:00', end: '11:00', discipline: 'wrestling',    location: '1256', level: 'all' },
  { day: 'sat', start: '11:00', end: '12:00', discipline: 'bjj-gi',       location: '1256', level: 'womens' },

  // 1133 Granville — Saturday
  { day: 'sat', start: '12:00', end: '13:30', discipline: 'bjj-gi',       location: '1133', level: 'all' },

  // ─────────────────────────────────────────────────────────────────────────
  // SUNDAY
  // ─────────────────────────────────────────────────────────────────────────

  // 1256 Granville — Sunday
  { day: 'sun', start: '10:00', end: '11:00', discipline: 'kids',         location: '1256', level: 'kids', note: 'Little Lions Martial Arts · 4–7 yrs' },
  { day: 'sun', start: '10:00', end: '11:00', discipline: 'kids',         location: '1256', level: 'teens', note: 'Teens Striking · 12+ yrs' },
  { day: 'sun', start: '11:15', end: '12:15', discipline: 'boxing',       location: '1256', level: 'all' },
  { day: 'sun', start: '12:30', end: '13:30', discipline: 'muay-thai',    location: '1256', level: 'beginner' },
  { day: 'sun', start: '12:30', end: '13:30', discipline: 'muay-thai',    location: '1256', level: 'intermediate' },

  // 1133 Granville — Sunday
  { day: 'sun', start: '12:00', end: '13:30', discipline: 'nogi',         location: '1133', level: 'all' },

];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getSessionsByDay(day: Day): ClassSession[] {
  return schedule
    .filter((s) => s.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function getSessionsByDiscipline(disciplineId: DisciplineId): ClassSession[] {
  const dayOrder: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return schedule
    .filter((s) => s.discipline === disciplineId)
    .sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      return dayDiff !== 0 ? dayDiff : a.start.localeCompare(b.start);
    });
}
