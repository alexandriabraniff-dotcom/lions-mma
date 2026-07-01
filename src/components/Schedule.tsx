import { useState, useEffect } from 'react';
import { schedule, DAY_LABELS, DAYS_ORDER } from '../data/schedule';
import type { ClassSession, Day } from '../data/schedule';
import { disciplines } from '../data/disciplines';
import { locations } from '../data/locations';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScheduleProps = {
  filterDiscipline?: string;
  compact?: boolean;
};

type ClassCardProps = {
  session: ClassSession;
  showLocation: boolean;
  compact: boolean;
  accentColor: string;
  getLevelLabel: (level?: string) => string;
  fmt12h: (t: string) => string;
  isCurrentTime: (s: ClassSession) => boolean;
};

// ─── Accent colors per discipline ─────────────────────────────────────────────

const DISCIPLINE_ACCENT_COLORS: Record<string, string> = {
  'muay-thai': '#C09A3C',
  'boxing':    '#8B7355',
  'bjj-gi':    '#4A6741',
  'nogi':      '#3D5A7A',
  'wrestling': '#7A4A3D',
  'mma':       '#5A3D6B',
  'womens':    '#8B4A6B',
  'kids':      '#4A7A6B',
  'private':   '#6B6B4A',
};

// ─── ClassCard sub-component ──────────────────────────────────────────────────

function ClassCard({
  session,
  showLocation,
  compact,
  accentColor,
  getLevelLabel,
  fmt12h,
  isCurrentTime,
}: ClassCardProps) {
  const isCurrent = isCurrentTime(session);
  const disciplineName =
    disciplines.find((d) => d.id === session.discipline)?.name ?? session.discipline;
  const locationShort =
    locations.find((l) => l.id === session.location)?.short ?? session.location;

  return (
    <div
      className={`mb-2 p-2 border-l-2 transition-colors ${
        isCurrent ? 'bg-void/50' : 'hover:bg-void/30'
      }`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className="font-mono text-xs text-smoke">
        {fmt12h(session.start)} &ndash; {fmt12h(session.end)}
      </div>
      <div
        className={`font-display uppercase tracking-tight mt-0.5 ${
          compact ? 'text-sm' : 'text-base'
        } text-canvas`}
      >
        {disciplineName}
      </div>
      {!compact && session.coach && (
        <div className="font-mono text-xs text-smoke mt-0.5">{session.coach}</div>
      )}
      <div className="flex gap-2 mt-1 flex-wrap items-center">
        {getLevelLabel(session.level) && (
          <span className="font-mono text-[10px] border border-iron text-smoke px-1.5 py-0.5">
            {getLevelLabel(session.level)}
          </span>
        )}
        {showLocation && (
          <span className="font-mono text-[10px] text-brass">{locationShort}</span>
        )}
        {isCurrent && (
          <span className="font-mono text-[10px] text-brass border border-brass px-1.5 py-0.5 animate-pulse">
            NOW
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Schedule component ───────────────────────────────────────────────────────

export default function Schedule({ filterDiscipline, compact = false }: ScheduleProps) {
  // ── Helper: get today's Day key ──────────────────────────────────────────────
  function getTodayDay(): Day {
    const jsDay = new Date().getDay(); // 0 = Sun
    const map: Record<number, Day> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    return map[jsDay] ?? 'mon';
  }

  // ── State ────────────────────────────────────────────────────────────────────
  const [activeLocation, setActiveLocation] = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay, setActiveDay] = useState<Day>(getTodayDay);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day'); // start as day; set on mount

  // ── Detect viewport on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setViewMode(window.innerWidth >= 768 ? 'week' : 'day');
  }, []);

  // ── Helper functions ─────────────────────────────────────────────────────────
  function fmt12h(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr ?? '00';
    if (hour === 0) return `12:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    if (hour < 12) return `${hour}:${minute} AM`;
    return `${hour - 12}:${minute} PM`;
  }

  function isCurrentDay(day: Day): boolean {
    return day === getTodayDay();
  }

  function isCurrentTime(session: ClassSession): boolean {
    if (!isCurrentDay(session.day)) return false;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = session.start.split(':').map(Number);
    const [endH, endM] = session.end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return nowMins >= startMins && nowMins < endMins;
  }

  function getLevelLabel(level?: string): string {
    switch (level) {
      case 'fundamentals': return 'Fund.';
      case 'advanced':     return 'Adv.';
      case 'competition':  return 'Comp.';
      case 'kids':         return 'Kids';
      case 'womens':       return "Women's";
      case 'all':          return '';
      default:             return '';
    }
  }

  // ── Filtered sessions ────────────────────────────────────────────────────────
  const effectiveDiscipline = filterDiscipline ?? activeDiscipline;

  const filteredSessions = schedule.filter((s) => {
    const locationMatch = activeLocation === 'all' || s.location === activeLocation;
    const disciplineMatch = effectiveDiscipline === 'all' || s.discipline === effectiveDiscipline;
    return locationMatch && disciplineMatch;
  });

  // ── Empty state check ────────────────────────────────────────────────────────
  const hasAnySessions = filteredSessions.length > 0;

  // ── Controls visibility ──────────────────────────────────────────────────────
  // Controls are hidden when compact=true AND filterDiscipline is set (embed mode)
  const showControls = !(compact && filterDiscipline);

  // ── Sorted sessions for a given day ─────────────────────────────────────────
  function getDaySessions(day: Day): ClassSession[] {
    return filteredSessions
      .filter((s) => s.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  // ── Reset filters ────────────────────────────────────────────────────────────
  function resetFilters() {
    setActiveLocation('all');
    setActiveDiscipline('all');
    setActiveDay(getTodayDay());
  }

  // ── Location button label ────────────────────────────────────────────────────
  function locationLabel(loc: string): string {
    if (loc === 'all') return 'ALL LOCATIONS';
    return `${loc} GRANVILLE`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={compact ? '' : 'py-2'}>

      {/* ── CONTROLS ── */}
      {showControls && (
        <div className="mb-8 flex flex-wrap gap-4 items-start">

          {/* Location toggle */}
          <div className="flex gap-0">
            {(['all', '1256', '1133'] as const).map((loc, i) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors ${
                  i === 0 ? '' : ''
                } ${
                  activeLocation === loc
                    ? 'bg-brass text-void'
                    : 'border border-iron text-smoke hover:text-canvas'
                }`}
              >
                {locationLabel(loc)}
              </button>
            ))}
          </div>

          {/* Discipline filter chips — only when filterDiscipline prop NOT set */}
          {!filterDiscipline && (
            <div className="flex flex-wrap gap-2">
              <button
                key="all"
                onClick={() => setActiveDiscipline('all')}
                className={`font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors ${
                  activeDiscipline === 'all'
                    ? 'bg-brass text-void'
                    : 'border border-iron text-smoke hover:text-canvas'
                }`}
              >
                ALL
              </button>
              {disciplines
                .filter((d) => d.id !== 'private')
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDiscipline(d.id)}
                    className={`font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors ${
                      activeDiscipline === d.id
                        ? 'bg-brass text-void'
                        : 'border border-iron text-smoke hover:text-canvas'
                    }`}
                  >
                    {d.short}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW MODE + DAY TABS ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">

        {/* Day pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {DAYS_ORDER.map((day) => (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setViewMode('day');
              }}
              className={`font-mono text-xs uppercase tracking-wider py-2 px-3 whitespace-nowrap transition-colors ${
                activeDay === day && viewMode === 'day'
                  ? 'bg-canvas text-void'
                  : isCurrentDay(day)
                  ? 'border border-brass text-brass'
                  : 'border border-iron text-smoke hover:text-canvas'
              }`}
            >
              {DAY_LABELS[day].slice(0, 3).toUpperCase()}
              {isCurrentDay(day) && <span className="ml-1 text-brass">&bull;</span>}
            </button>
          ))}
        </div>

        {/* Week view toggle — desktop only */}
        <button
          onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
          className="hidden md:block font-mono text-xs uppercase tracking-wider text-smoke hover:text-canvas border border-iron py-2 px-3 transition-colors"
        >
          {viewMode === 'week' ? 'DAY VIEW' : 'WEEK VIEW'}
        </button>
      </div>

      {/* ── EMPTY STATE ── */}
      {!hasAnySessions && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="font-mono text-sm text-smoke tracking-wider">
            No classes match the current filter.
          </p>
          <button
            onClick={resetFilters}
            className="font-mono text-xs uppercase tracking-wider border border-iron text-smoke hover:text-canvas py-2 px-4 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {hasAnySessions && viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-px bg-iron">
          {DAYS_ORDER.map((day) => {
            const sessions = getDaySessions(day);
            const today = isCurrentDay(day);
            return (
              <div
                key={day}
                className={`p-3 min-h-48 ${today ? 'bg-void' : 'bg-vault'}`}
              >
                <div
                  className={`font-mono text-xs uppercase tracking-wider mb-3 pb-2 border-b ${
                    today ? 'text-brass border-brass' : 'text-smoke border-iron'
                  }`}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                  {today && <span> TODAY</span>}
                </div>
                {sessions.length === 0 ? (
                  <div className="text-smoke text-xs font-mono mt-2">&mdash;</div>
                ) : (
                  sessions.map((session, i) => (
                    <ClassCard
                      key={i}
                      session={session}
                      showLocation={activeLocation === 'all'}
                      compact={true}
                      accentColor={DISCIPLINE_ACCENT_COLORS[session.discipline] ?? '#C09A3C'}
                      getLevelLabel={getLevelLabel}
                      fmt12h={fmt12h}
                      isCurrentTime={isCurrentTime}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DAY VIEW ── */}
      {hasAnySessions && viewMode === 'day' && (
        <div className="flex flex-col gap-2">
          {getDaySessions(activeDay).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="font-mono text-sm text-smoke tracking-wider">
                No classes on {DAY_LABELS[activeDay]} with the current filters.
              </p>
              <button
                onClick={resetFilters}
                className="font-mono text-xs uppercase tracking-wider border border-iron text-smoke hover:text-canvas py-2 px-4 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            getDaySessions(activeDay).map((session, i) => (
              <ClassCard
                key={i}
                session={session}
                showLocation={activeLocation === 'all'}
                compact={false}
                accentColor={DISCIPLINE_ACCENT_COLORS[session.discipline] ?? '#C09A3C'}
                getLevelLabel={getLevelLabel}
                fmt12h={fmt12h}
                isCurrentTime={isCurrentTime}
              />
            ))
          )}
        </div>
      )}

      {/* ── EMBED DISCLAIMER ── */}
      {compact && filterDiscipline && (
        <p className="mt-4 font-mono text-[11px] text-smoke tracking-wide">
          Times shown are placeholders. Confirm current schedule with the gym.
        </p>
      )}
    </div>
  );
}
