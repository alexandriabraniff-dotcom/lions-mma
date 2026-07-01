import type { DisciplineId } from './disciplines';
import type { LocationId } from './locations';

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Level = 'all' | 'fundamentals' | 'advanced' | 'competition' | 'kids' | 'womens';

export type ClassSession = {
  day: Day;
  start: string;   // 24h e.g. '18:00'
  end: string;
  discipline: DisciplineId;
  location: LocationId;
  level?: Level;
  coach?: string;
};

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

export const schedule: ClassSession[] = [
  // ─── MONDAY ───
  { day: 'mon', start: '06:00', end: '07:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'mon', start: '06:00', end: '07:00', discipline: 'bjj-gi',     location: '1133', level: 'fundamentals', coach: 'Guilherme Falcao' },
  { day: 'mon', start: '12:00', end: '13:00', discipline: 'boxing',     location: '1256', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'mon', start: '17:30', end: '18:30', discipline: 'muay-thai',  location: '1256', level: 'fundamentals', coach: 'Adam Karse' },
  { day: 'mon', start: '17:30', end: '18:30', discipline: 'bjj-gi',     location: '1133', level: 'all',          coach: 'Guilherme Falcao' },
  { day: 'mon', start: '18:30', end: '19:30', discipline: 'muay-thai',  location: '1256', level: 'advanced',     coach: 'Amir Ghassemi' },
  { day: 'mon', start: '18:30', end: '19:30', discipline: 'nogi',       location: '1133', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'mon', start: '19:30', end: '20:30', discipline: 'mma',        location: '1256', level: 'advanced',     coach: 'Rodrigo Sezinando' },
  { day: 'mon', start: '16:30', end: '17:30', discipline: 'kids',       location: '1256', level: 'kids',         coach: 'Alex Coles' },

  // ─── TUESDAY ───
  { day: 'tue', start: '06:00', end: '07:00', discipline: 'bjj-gi',     location: '1256', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'tue', start: '06:00', end: '07:00', discipline: 'muay-thai',  location: '1133', level: 'all',          coach: 'Adam Karse' },
  { day: 'tue', start: '12:00', end: '13:00', discipline: 'nogi',       location: '1133', level: 'fundamentals', coach: 'Guilherme Falcao' },
  { day: 'tue', start: '17:30', end: '18:30', discipline: 'boxing',     location: '1256', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'tue', start: '17:30', end: '18:30', discipline: 'muay-thai',  location: '1133', level: 'fundamentals', coach: 'Adam Karse' },
  { day: 'tue', start: '18:30', end: '19:30', discipline: 'bjj-gi',     location: '1256', level: 'advanced',     coach: 'Guilherme Falcao' },
  { day: 'tue', start: '18:30', end: '19:30', discipline: 'muay-thai',  location: '1133', level: 'advanced',     coach: 'Amir Ghassemi' },
  { day: 'tue', start: '19:30', end: '20:30', discipline: 'bjj-gi',     location: '1256', level: 'competition',  coach: 'Guilherme Falcao' },
  { day: 'tue', start: '16:30', end: '17:30', discipline: 'kids',       location: '1133', level: 'kids',         coach: 'Emma Stecklov' },

  // ─── WEDNESDAY ───
  { day: 'wed', start: '06:00', end: '07:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'wed', start: '12:00', end: '13:00', discipline: 'bjj-gi',     location: '1256', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'wed', start: '12:00', end: '13:00', discipline: 'boxing',     location: '1133', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'wed', start: '17:30', end: '18:30', discipline: 'muay-thai',  location: '1256', level: 'fundamentals', coach: 'Adam Karse' },
  { day: 'wed', start: '17:30', end: '18:30', discipline: 'bjj-gi',     location: '1133', level: 'fundamentals', coach: 'Rodrigo Sezinando' },
  { day: 'wed', start: '18:00', end: '19:00', discipline: 'womens',     location: '1256', level: 'womens',       coach: 'Jessica Wilson' },
  { day: 'wed', start: '18:30', end: '19:30', discipline: 'muay-thai',  location: '1256', level: 'advanced',     coach: 'Amir Ghassemi' },
  { day: 'wed', start: '18:30', end: '19:30', discipline: 'nogi',       location: '1133', level: 'all',          coach: 'Guilherme Falcao' },
  { day: 'wed', start: '19:30', end: '20:30', discipline: 'wrestling',  location: '1133', level: 'all' },
  { day: 'wed', start: '16:30', end: '17:30', discipline: 'kids',       location: '1256', level: 'kids',         coach: 'Alex Coles' },

  // ─── THURSDAY ───
  { day: 'thu', start: '06:00', end: '07:00', discipline: 'bjj-gi',     location: '1133', level: 'all',          coach: 'Guilherme Falcao' },
  { day: 'thu', start: '06:00', end: '07:00', discipline: 'boxing',     location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'thu', start: '12:00', end: '13:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'thu', start: '17:30', end: '18:30', discipline: 'bjj-gi',     location: '1256', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'thu', start: '17:30', end: '18:30', discipline: 'muay-thai',  location: '1133', level: 'fundamentals', coach: 'Adam Karse' },
  { day: 'thu', start: '18:30', end: '19:30', discipline: 'nogi',       location: '1256', level: 'advanced',     coach: 'Guilherme Falcao' },
  { day: 'thu', start: '18:30', end: '19:30', discipline: 'muay-thai',  location: '1133', level: 'advanced',     coach: 'Amir Ghassemi' },
  { day: 'thu', start: '19:30', end: '20:30', discipline: 'mma',        location: '1133', level: 'advanced',     coach: 'Rodrigo Sezinando' },
  { day: 'thu', start: '16:30', end: '17:30', discipline: 'kids',       location: '1133', level: 'kids',         coach: 'Emma Stecklov' },

  // ─── FRIDAY ───
  { day: 'fri', start: '06:00', end: '07:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'fri', start: '06:00', end: '07:00', discipline: 'bjj-gi',     location: '1133', level: 'all',          coach: 'Rodrigo Sezinando' },
  { day: 'fri', start: '12:00', end: '13:00', discipline: 'boxing',     location: '1256', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'fri', start: '17:30', end: '18:30', discipline: 'muay-thai',  location: '1256', level: 'fundamentals', coach: 'Adam Karse' },
  { day: 'fri', start: '17:30', end: '18:30', discipline: 'bjj-gi',     location: '1133', level: 'fundamentals', coach: 'Guilherme Falcao' },
  { day: 'fri', start: '18:00', end: '19:00', discipline: 'womens',     location: '1133', level: 'womens',       coach: 'Jessica Wilson' },
  { day: 'fri', start: '18:30', end: '19:30', discipline: 'muay-thai',  location: '1256', level: 'advanced',     coach: 'Amir Ghassemi' },
  { day: 'fri', start: '18:30', end: '19:30', discipline: 'nogi',       location: '1133', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'fri', start: '19:30', end: '20:30', discipline: 'bjj-gi',     location: '1256', level: 'competition',  coach: 'Guilherme Falcao' },
  { day: 'fri', start: '16:30', end: '17:30', discipline: 'kids',       location: '1256', level: 'kids',         coach: 'Alex Coles' },

  // ─── SATURDAY ───
  { day: 'sat', start: '09:00', end: '10:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'sat', start: '09:00', end: '10:00', discipline: 'bjj-gi',     location: '1133', level: 'all',          coach: 'Guilherme Falcao' },
  { day: 'sat', start: '10:00', end: '11:00', discipline: 'boxing',     location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'sat', start: '10:00', end: '11:00', discipline: 'nogi',       location: '1133', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'sat', start: '11:00', end: '12:00', discipline: 'wrestling',  location: '1256', level: 'all' },
  { day: 'sat', start: '11:00', end: '12:00', discipline: 'mma',        location: '1133', level: 'advanced',     coach: 'Rodrigo Sezinando' },
  { day: 'sat', start: '09:30', end: '10:30', discipline: 'kids',       location: '1256', level: 'kids',         coach: 'Alex Coles' },

  // ─── SUNDAY ───
  { day: 'sun', start: '10:00', end: '11:00', discipline: 'muay-thai',  location: '1256', level: 'all',          coach: 'Adam Karse' },
  { day: 'sun', start: '10:00', end: '11:00', discipline: 'bjj-gi',     location: '1133', level: 'all',          coach: 'Guilherme Falcao' },
  { day: 'sun', start: '11:00', end: '12:00', discipline: 'nogi',       location: '1256', level: 'all',          coach: 'Gabrielle Stan' },
  { day: 'sun', start: '11:00', end: '12:00', discipline: 'boxing',     location: '1133', level: 'all',          coach: 'Amir Ghassemi' },
  { day: 'sun', start: '12:00', end: '13:00', discipline: 'bjj-gi',     location: '1256', level: 'competition',  coach: 'Guilherme Falcao' },
  { day: 'sun', start: '10:00', end: '11:00', discipline: 'kids',       location: '1133', level: 'kids',         coach: 'Emma Stecklov' },
];

export default schedule;

export function getSessionsByDay(day: Day): ClassSession[] {
  return schedule
    .filter((s) => s.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function getSessionsByDiscipline(disciplineId: DisciplineId): ClassSession[] {
  return schedule.filter((s) => s.discipline === disciplineId);
}
