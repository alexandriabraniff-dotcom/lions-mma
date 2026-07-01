import { useState, useEffect, useRef, type RefObject } from 'react';
import { schedule, DAY_LABELS, DAYS_ORDER } from '../data/schedule';
import type { ClassSession, Day, Level } from '../data/schedule';
import { disciplines } from '../data/disciplines';
import { locations } from '../data/locations';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScheduleProps = {
  filterDiscipline?: string;
  compact?: boolean;
};

type GroupedSession = Omit<ClassSession, 'level'> & {
  levels: (Level | undefined)[];
};

type LaidOutSession = GroupedSession & {
  col: number;
  totalCols: number;
};

// ─── Grid constants ───────────────────────────────────────────────────────────

const START_HOUR  = 6;                               // 6 AM
const END_HOUR    = 22;                              // 10 PM
const HOUR_PX     = 60;                              // 60 px = 1 hour = 1 px/min
const TOTAL_H     = (END_HOUR - START_HOUR) * HOUR_PX;
const HOURS       = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TIME_COL_W  = 52;                              // px — left time label column

// ─── Discipline accent colours ────────────────────────────────────────────────

const ACCENT: Record<string, string> = {
  'muay-thai':    '#C09A3C',
  'boxing':       '#8B7355',
  'dutch':        '#A07840',
  'bjj-gi':       '#4A6741',
  'nogi':         '#3D5A7A',
  'wrestling':    '#7A4A3D',
  'mma':          '#5A3D6B',
  'conditioning': '#5A6B4A',
  'womens':       '#8B4A6B',
  'kids':         '#4A7A6B',
  'private':      '#6B6B4A',
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getLevelLabel(level?: string): string {
  switch (level) {
    case 'beginner':     return 'Beginner';
    case 'intermediate': return 'Int–Adv';
    case 'all':          return 'All Levels';
    case 'womens':       return "Women's Only";
    case 'kids':         return 'Kids';
    case 'teens':        return 'Teens 12+';
    case 'competition':  return 'Competition';
    default:             return '';
  }
}

function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Pixel offset from the top of the grid for a given HH:MM string. */
function toPx(time: string): number {
  return toMin(time) - START_HOUR * 60; // 1px per minute
}

/** Height in px for a class that runs from start to end. */
function heightPx(start: string, end: string): number {
  return Math.max(toMin(end) - toMin(start), 24); // 24px minimum
}

function fmt12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  if (h === 0)  return `12:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  if (h < 12)   return `${h}:${m} AM`;
  return `${h - 12}:${m} PM`;
}

function fmtHour(h: number): string {
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12)   return `${h} AM`;
  return `${h - 12} PM`;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────
//
// Simultaneous sessions with the same discipline + location + note collapse
// into one block showing combined levels (e.g. "Beginner / Int–Adv").

function groupSessions(raw: ClassSession[]): GroupedSession[] {
  const map = new Map<string, GroupedSession>();
  for (const s of raw) {
    const key = `${s.start}|${s.discipline}|${s.location}|${s.note ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.levels.push(s.level);
      if (s.end > existing.end) existing.end = s.end;
    } else {
      const { level, ...rest } = s;
      map.set(key, { ...rest, levels: [level] });
    }
  }
  return Array.from(map.values());
}

// ─── Overlap layout (interval-graph column assignment) ────────────────────────
//
// Assigns each event a `col` index so no two overlapping events share a column,
// and a `totalCols` equal to the width of the maximum clique it belongs to.
// This is the same algorithm Google Calendar uses internally.

function layoutSessions(sessions: GroupedSession[]): LaidOutSession[] {
  const sorted = [...sessions].sort((a, b) => toMin(a.start) - toMin(b.start));
  const laid: LaidOutSession[] = sorted.map(s => ({ ...s, col: 0, totalCols: 1 }));

  // Greedy column assignment
  const colEnds: number[] = [];
  for (const ev of laid) {
    const start = toMin(ev.start);
    const end   = toMin(ev.end);
    let col = 0;
    while (col < colEnds.length && colEnds[col] > start) col++;
    ev.col = col;
    colEnds[col] = end;
  }

  // Compute totalCols = size of largest clique each event participates in
  for (const ev of laid) {
    const s = toMin(ev.start);
    const e = toMin(ev.end);
    let maxCol = ev.col;
    for (const other of laid) {
      if (toMin(other.start) < e && toMin(other.end) > s) {
        maxCol = Math.max(maxCol, other.col);
      }
    }
    ev.totalCols = maxCol + 1;
  }

  return laid;
}

// ─── EventBlock ───────────────────────────────────────────────────────────────

function EventBlock({
  session,
  isCurrent,
  showLocation,
  inWeekView,
}: {
  session:      LaidOutSession;
  isCurrent:    boolean;
  showLocation: boolean;
  inWeekView:   boolean;
}) {
  const accent   = ACCENT[session.discipline] ?? '#C09A3C';
  const name     = disciplines.find(d => d.id === session.discipline)?.name  ?? session.discipline;
  const short    = disciplines.find(d => d.id === session.discipline)?.short ?? session.discipline;
  const locShort = locations.find(l => l.id === session.location)?.short     ?? session.location;
  const levels   = [...new Set(session.levels.map(getLevelLabel).filter(Boolean))].join(' / ');

  const top    = toPx(session.start) + 1;
  const h      = heightPx(session.start, session.end) - 2;
  const leftPct = (session.col  / session.totalCols) * 100;
  const wPct    = (1            / session.totalCols) * 100;

  return (
    <div
      className="absolute overflow-hidden select-none transition-opacity hover:opacity-90"
      style={{
        top:    top,
        height: h,
        left:   `calc(${leftPct}% + 1px)`,
        width:  `calc(${wPct}%  - 2px)`,
        backgroundColor: `${accent}1C`,
        borderLeft:      `2px solid ${accent}`,
        boxShadow:       isCurrent ? `inset 0 0 0 1px ${accent}55` : 'none',
      }}
    >
      <div className="p-1.5 h-full overflow-hidden flex flex-col gap-0.5">

        {/* Discipline name */}
        <span
          className="font-display uppercase leading-tight truncate"
          style={{ fontSize: inWeekView ? '10px' : '12px', fontWeight: 700, color: accent }}
        >
          {inWeekView ? short : name}
        </span>

        {/* Start time — only if tall enough */}
        {h >= 30 && (
          <span className="font-mono leading-none" style={{ fontSize: '10px', color: '#8A8480' }}>
            {fmt12h(session.start)}
          </span>
        )}

        {/* Level — day view only, if tall enough */}
        {!inWeekView && h >= 48 && levels && (
          <span className="font-mono leading-none" style={{ fontSize: '10px', color: '#8A8480' }}>
            {levels}
          </span>
        )}

        {/* Location — day view, "All" filter, if tall enough */}
        {!inWeekView && showLocation && h >= 62 && (
          <span className="font-mono leading-none" style={{ fontSize: '10px', color: accent }}>
            {locShort}
          </span>
        )}

        {/* Note — day view, if tall enough */}
        {!inWeekView && session.note && h >= 78 && (
          <span className="font-mono leading-none" style={{ fontSize: '10px', color: accent }}>
            {session.note}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── TimeGrid ─────────────────────────────────────────────────────────────────

function TimeGrid({
  viewMode,
  activeDay,
  todayDay,
  getGroupedDay,
  activeLocation,
  scrollRef,
}: {
  viewMode:       'week' | 'day';
  activeDay:      Day;
  todayDay:       Day;
  getGroupedDay:  (day: Day) => GroupedSession[];
  activeLocation: string;
  scrollRef:      RefObject<HTMLDivElement>;
}) {
  const inWeekView  = viewMode === 'week';
  const daysToShow  = inWeekView ? DAYS_ORDER : [activeDay];

  const nowMin  = new Date().getHours() * 60 + new Date().getMinutes();
  const nowPx   = nowMin - START_HOUR * 60;
  const showNow = nowMin >= START_HOUR * 60 && nowMin < END_HOUR * 60;

  function isCurrent(s: GroupedSession): boolean {
    return s.day === todayDay && nowMin >= toMin(s.start) && nowMin < toMin(s.end);
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto scrollbar-hide"
      style={{ maxHeight: '640px', overscrollBehavior: 'contain' }}
    >
      <div className="flex" style={{ height: TOTAL_H, minHeight: TOTAL_H }}>

        {/* ── Time label column ── */}
        <div className="shrink-0 relative" style={{ width: TIME_COL_W, minWidth: TIME_COL_W }}>
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute right-2 font-mono leading-none select-none"
              style={{ top: (h - START_HOUR) * HOUR_PX - 7, fontSize: '10px', color: '#8A8480' }}
            >
              {fmtHour(h)}
            </div>
          ))}
        </div>

        {/* ── Grid body ── */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ borderLeft: '1px solid #2C2824' }}
        >
          {/* Hour lines */}
          {HOURS.map(h => (
            <div
              key={`h-${h}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: (h - START_HOUR) * HOUR_PX, borderTop: '1px solid #2C2824' }}
            />
          ))}

          {/* Half-hour lines (dimmer) */}
          {HOURS.map(h => (
            <div
              key={`hh-${h}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: (h - START_HOUR) * HOUR_PX + 30, borderTop: '1px solid #1A1714' }}
            />
          ))}

          {/* Current-time indicator */}
          {showNow && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: nowPx }}
            >
              <div style={{ position: 'relative', height: 0, borderTop: '1.5px solid #C09A3C' }}>
                <div
                  style={{
                    position: 'absolute', left: -4, top: -4,
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: '#C09A3C',
                  }}
                />
              </div>
            </div>
          )}

          {/* Day columns */}
          <div className="flex absolute inset-0" style={{ height: TOTAL_H }}>
            {daysToShow.map(day => {
              const isToday  = day === todayDay;
              const sessions = layoutSessions(getGroupedDay(day));
              return (
                <div
                  key={day}
                  className="flex-1 relative"
                  style={{
                    borderRight:     '1px solid #2C2824',
                    backgroundColor: isToday ? 'rgba(192,154,60,0.025)' : 'transparent',
                    minWidth:        inWeekView ? 0 : undefined,
                  }}
                >
                  {sessions.map((s, i) => (
                    <EventBlock
                      key={i}
                      session={s}
                      isCurrent={isCurrent(s)}
                      showLocation={activeLocation === 'all'}
                      inWeekView={inWeekView}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export default function Schedule({ filterDiscipline, compact = false }: ScheduleProps) {
  const dayTabsRef  = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);

  function getTodayDay(): Day {
    const m: Record<number, Day> = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
    return m[new Date().getDay()] ?? 'mon';
  }

  const [activeLocation,   setActiveLocation]   = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay,        setActiveDay]        = useState<Day>(getTodayDay);
  const [viewMode,         setViewMode]         = useState<'week' | 'day'>('day');

  // Default to week view on large screens
  useEffect(() => {
    setViewMode(window.innerWidth >= 1024 ? 'week' : 'day');
  }, []);

  // On mount, scroll the grid so current time is visible (or 8 AM if earlier)
  useEffect(() => {
    if (!gridRef.current) return;
    const h = Math.max(START_HOUR, new Date().getHours() - 1);
    gridRef.current.scrollTop = (h - START_HOUR) * HOUR_PX;
  }, []);

  // Keep active day tab visible
  useEffect(() => {
    if (!dayTabsRef.current) return;
    const btn = dayTabsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeDay]);

  function isCurrentDay(day: Day): boolean { return day === getTodayDay(); }

  const effectiveDiscipline = filterDiscipline ?? activeDiscipline;

  const filtered = schedule.filter(s => {
    const locOk  = activeLocation === 'all' || s.location === activeLocation;
    const discOk = effectiveDiscipline === 'all' || s.discipline === effectiveDiscipline;
    return locOk && discOk;
  });

  function getGroupedDay(day: Day): GroupedSession[] {
    return groupSessions(
      filtered.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start))
    );
  }

  function getDayCount(day: Day): number { return getGroupedDay(day).length; }

  function resetFilters() {
    setActiveLocation('all');
    setActiveDiscipline('all');
    setActiveDay(getTodayDay());
  }

  const todayDay       = getTodayDay();
  const hasAny         = filtered.length > 0;
  const showControls   = !(compact && filterDiscipline);

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className={compact ? '' : 'py-2'}>

      {/* ── Controls ── */}
      {showControls && (
        <div className="mb-4 space-y-3">

          {/* Location toggle */}
          <div className="flex w-full">
            {(['all', '1256', '1133'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className="flex-1 font-mono text-xs tracking-wider uppercase py-3 transition-colors"
                style={{
                  backgroundColor: activeLocation === loc ? '#C09A3C' : 'transparent',
                  color:           activeLocation === loc ? '#0D0B09' : '#8A8480',
                  border:          '1px solid #2C2824',
                  marginRight:     '-1px',
                }}
              >
                {loc === 'all' ? 'ALL' : loc}
              </button>
            ))}
          </div>

          {/* Discipline chips */}
          {!filterDiscipline && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              <button
                onClick={() => setActiveDiscipline('all')}
                className="shrink-0 flex items-center gap-2 font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: activeDiscipline === 'all' ? '#C09A3C' : 'transparent',
                  color:           activeDiscipline === 'all' ? '#0D0B09' : '#8A8480',
                  border:          '1px solid #2C2824',
                }}
              >
                All Disciplines
              </button>
              {disciplines.filter(d => d.id !== 'private').map(d => {
                const accent   = ACCENT[d.id] ?? '#C09A3C';
                const isActive = activeDiscipline === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDiscipline(d.id)}
                    className="shrink-0 flex items-center gap-2 font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? `${accent}22` : 'transparent',
                      color:           isActive ? accent : '#8A8480',
                      border:          `1px solid ${isActive ? accent : '#2C2824'}`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                    {d.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Calendar header: day tabs + week toggle ── */}
      <div className="flex items-stretch" style={{ borderBottom: '1px solid #2C2824' }}>

        {/* Spacer — lines up with time-label column */}
        <div className="shrink-0" style={{ width: TIME_COL_W }} />

        {/* Day tabs */}
        <div
          ref={dayTabsRef}
          className="flex flex-1 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {DAYS_ORDER.map(day => {
            const isActive = viewMode === 'day' && activeDay === day;
            const isToday  = isCurrentDay(day);
            const count    = getDayCount(day);
            return (
              <button
                key={day}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => { setActiveDay(day); setViewMode('day'); }}
                className="flex-1 shrink-0 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                style={{
                  minWidth:        '52px',
                  maxWidth:        '80px',
                  backgroundColor: isActive  ? '#EEE8DC'    : 'transparent',
                  color:           isActive  ? '#0D0B09'
                                 : isToday  ? '#C09A3C'
                                 :             '#8A8480',
                  borderBottom:    isToday && !isActive ? '2px solid #C09A3C' : '2px solid transparent',
                }}
              >
                <span className="font-mono text-[11px] uppercase tracking-wider leading-none">
                  {DAY_LABELS[day].slice(0, 3)}
                </span>
                <span
                  className="font-display text-lg leading-none"
                  style={{
                    color: isActive ? '#0D0B09'
                         : isToday  ? '#C09A3C'
                         : count > 0 ? '#EEE8DC'
                         : '#2C2824',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Week view toggle (desktop only) */}
        <button
          onClick={() => setViewMode(v => v === 'week' ? 'day' : 'week')}
          className="hidden lg:flex shrink-0 items-center gap-2 px-4 font-mono text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap"
          style={{
            color:      viewMode === 'week' ? '#C09A3C' : '#8A8480',
            borderLeft: '1px solid #2C2824',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1"   y="1"   width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="5.5" y="1"   width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="10"  y="1"   width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="1"   y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="5.5" y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="10"  y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="1"   y="10"  width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="5.5" y="10"  width="3" height="3" fill="currentColor" rx="0.5"/>
            <rect x="10"  y="10"  width="3" height="3" fill="currentColor" rx="0.5"/>
          </svg>
          Week
        </button>
      </div>

      {/* ── Empty state ── */}
      {!hasAny && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="font-mono text-sm tracking-wider text-center" style={{ color: '#8A8480' }}>
            No classes match the current filter.
          </p>
          <button
            onClick={resetFilters}
            className="font-mono text-xs uppercase tracking-wider py-2 px-4"
            style={{ border: '1px solid #2C2824', color: '#8A8480' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Time grid ── */}
      {hasAny && (
        <TimeGrid
          viewMode={viewMode}
          activeDay={activeDay}
          todayDay={todayDay}
          getGroupedDay={getGroupedDay}
          activeLocation={activeLocation}
          scrollRef={gridRef}
        />
      )}

      {/* ── Compact disclaimer ── */}
      {compact && filterDiscipline && (
        <p className="mt-4 font-mono text-[11px] tracking-wide" style={{ color: '#8A8480' }}>
          Times shown are from the current schedule. Confirm with the gym for any changes.
        </p>
      )}
    </div>
  );
}
