import { useState, useEffect, useRef } from 'react';
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

// ─── ClassCard ────────────────────────────────────────────────────────────────

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
  const levelLabel = getLevelLabel(session.level);

  if (compact) {
    // ── Week-view compact card (desktop columns) ─────────────────────────────
    return (
      <div
        className="mb-1.5 pl-3 pr-2 py-2 border-l-2 transition-colors"
        style={{
          borderLeftColor: accentColor,
          backgroundColor: isCurrent ? 'rgba(192,154,60,0.08)' : 'transparent',
        }}
      >
        <div className="font-mono text-[10px] text-smoke leading-none mb-0.5">
          {fmt12h(session.start)}
        </div>
        <div className="font-display text-sm uppercase tracking-tight text-canvas leading-tight">
          {disciplineName}
        </div>
        {session.note && (
          <div className="font-mono text-[9px] mt-0.5 leading-none" style={{ color: '#6E6560' }}>
            {session.note}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {levelLabel && (
            <span
              className="font-mono text-[9px] px-1 py-0.5 leading-none"
              style={{ border: '1px solid #2C2824', color: '#6E6560' }}
            >
              {levelLabel}
            </span>
          )}
          {showLocation && (
            <span className="font-mono text-[9px]" style={{ color: accentColor }}>
              {locationShort}
            </span>
          )}
          {isCurrent && (
            <span
              className="font-mono text-[9px] px-1 py-0.5 leading-none animate-pulse"
              style={{ border: `1px solid ${accentColor}`, color: accentColor }}
            >
              NOW
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Day-view full card (mobile + desktop day view) ─────────────────────────
  return (
    <div
      className="relative overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: isCurrent ? '#1A1714' : '#1A1714',
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: isCurrent ? `0 0 0 1px ${accentColor}33` : 'none',
      }}
    >
      {/* Subtle accent tint when active */}
      {isCurrent && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `${accentColor}08` }}
        />
      )}

      <div className="relative flex items-stretch gap-0">
        {/* Time column */}
        <div
          className="flex flex-col justify-center items-end shrink-0 px-4 py-4 border-r"
          style={{ borderColor: '#2C2824', minWidth: '88px' }}
        >
          <span className="font-mono text-xs text-canvas leading-none">
            {fmt12h(session.start)}
          </span>
          <span className="font-mono text-[10px] mt-1 leading-none" style={{ color: '#6E6560' }}>
            {fmt12h(session.end)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl uppercase tracking-tight text-canvas leading-none">
                {disciplineName}
              </div>
              {session.note && (
                <div className="font-mono text-xs mt-1 leading-snug" style={{ color: '#C09A3C' }}>
                  {session.note}
                </div>
              )}
              {session.coach && (
                <div className="font-mono text-xs mt-1" style={{ color: '#6E6560' }}>
                  {session.coach}
                </div>
              )}
            </div>

            {/* NOW badge */}
            {isCurrent && (
              <div
                className="shrink-0 font-mono text-[10px] px-2 py-1 animate-pulse leading-none"
                style={{ border: `1px solid ${accentColor}`, color: accentColor }}
              >
                NOW
              </div>
            )}
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {levelLabel && (
              <span
                className="font-mono text-[10px] px-2 py-1 leading-none"
                style={{ border: '1px solid #2C2824', color: '#6E6560' }}
              >
                {levelLabel}
              </span>
            )}
            {showLocation && (
              <span
                className="font-mono text-[10px] px-2 py-1 leading-none"
                style={{
                  border: `1px solid ${accentColor}66`,
                  color: accentColor,
                }}
              >
                {locationShort} GRANVILLE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule component ───────────────────────────────────────────────────────

export default function Schedule({ filterDiscipline, compact = false }: ScheduleProps) {
  const dayTabsRef = useRef<HTMLDivElement>(null);

  // ── Helper: today's Day key ───────────────────────────────────────────────
  function getTodayDay(): Day {
    const map: Record<number, Day> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
    return map[new Date().getDay()] ?? 'mon';
  }

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeLocation, setActiveLocation] = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay, setActiveDay] = useState<Day>(getTodayDay);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');

  useEffect(() => {
    setViewMode(window.innerWidth >= 768 ? 'week' : 'day');
  }, []);

  // Scroll active day tab into view
  useEffect(() => {
    if (!dayTabsRef.current) return;
    const activeBtn = dayTabsRef.current.querySelector('[data-active="true"]') as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }, [activeDay]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt12h(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr ?? '00';
    if (hour === 0)  return `12:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    if (hour < 12)   return `${hour}:${minute} AM`;
    return `${hour - 12}:${minute} PM`;
  }

  function isCurrentDay(day: Day): boolean {
    return day === getTodayDay();
  }

  function isCurrentTime(session: ClassSession): boolean {
    if (!isCurrentDay(session.day)) return false;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = session.start.split(':').map(Number);
    const [eH, eM] = session.end.split(':').map(Number);
    return nowMins >= sH * 60 + sM && nowMins < eH * 60 + eM;
  }

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

  // ── Filtering ─────────────────────────────────────────────────────────────
  const effectiveDiscipline = filterDiscipline ?? activeDiscipline;

  const filteredSessions = schedule.filter((s) => {
    const locOk  = activeLocation === 'all' || s.location === activeLocation;
    const discOk = effectiveDiscipline === 'all' || s.discipline === effectiveDiscipline;
    return locOk && discOk;
  });

  function getDaySessions(day: Day): ClassSession[] {
    return filteredSessions
      .filter((s) => s.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  function getDayCount(day: Day): number {
    return getDaySessions(day).length;
  }

  const hasAnySessions = filteredSessions.length > 0;
  const showControls   = !(compact && filterDiscipline);

  function resetFilters() {
    setActiveLocation('all');
    setActiveDiscipline('all');
    setActiveDay(getTodayDay());
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={compact ? '' : 'py-2'}>

      {/* ── CONTROLS ── */}
      {showControls && (
        <div className="mb-6 space-y-4">

          {/* Location toggle — full-width on mobile */}
          <div className="flex w-full">
            {(['all', '1256', '1133'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className="flex-1 font-mono text-xs tracking-wider uppercase py-3 transition-colors"
                style={{
                  backgroundColor: activeLocation === loc ? '#C09A3C' : 'transparent',
                  color: activeLocation === loc ? '#0D0B09' : '#6E6560',
                  border: '1px solid #2C2824',
                  marginRight: '-1px',
                }}
              >
                {loc === 'all' ? 'ALL' : loc}
              </button>
            ))}
          </div>

          {/* Discipline chips — horizontal scroll, styled with accent color dots */}
          {!filterDiscipline && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* ALL chip */}
              <button
                onClick={() => setActiveDiscipline('all')}
                className="shrink-0 flex items-center gap-2 font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: activeDiscipline === 'all' ? '#C09A3C' : 'transparent',
                  color: activeDiscipline === 'all' ? '#0D0B09' : '#6E6560',
                  border: '1px solid #2C2824',
                }}
              >
                All Disciplines
              </button>

              {disciplines
                .filter((d) => d.id !== 'private')
                .map((d) => {
                  const accent = DISCIPLINE_ACCENT_COLORS[d.id] ?? '#C09A3C';
                  const isActive = activeDiscipline === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setActiveDiscipline(d.id)}
                      className="shrink-0 flex items-center gap-2 font-mono text-xs tracking-wider uppercase py-2 px-3 transition-colors whitespace-nowrap"
                      style={{
                        backgroundColor: isActive ? `${accent}22` : 'transparent',
                        color: isActive ? accent : '#6E6560',
                        border: `1px solid ${isActive ? accent : '#2C2824'}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      {d.name}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── DAY TABS ── */}
      <div className="mb-4">
        <div
          ref={dayTabsRef}
          className="flex gap-0 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {DAYS_ORDER.map((day) => {
            const isActive = activeDay === day && viewMode === 'day';
            const isToday  = isCurrentDay(day);
            const count    = getDayCount(day);

            return (
              <button
                key={day}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => { setActiveDay(day); setViewMode('day'); }}
                className="shrink-0 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                style={{
                  minWidth: '56px',
                  flex: '1 0 auto',
                  maxWidth: '72px',
                  backgroundColor: isActive ? '#EEE8DC' : isToday ? 'transparent' : 'transparent',
                  color: isActive ? '#0D0B09' : isToday ? '#C09A3C' : '#6E6560',
                  border: isActive
                    ? '1px solid #EEE8DC'
                    : isToday
                    ? '1px solid #C09A3C'
                    : '1px solid #2C2824',
                  marginRight: '-1px',
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider leading-none">
                  {DAY_LABELS[day].slice(0, 3)}
                </span>
                <span
                  className="font-display text-lg leading-none"
                  style={{ color: isActive ? '#0D0B09' : isToday ? '#C09A3C' : count > 0 ? '#EEE8DC' : '#2C2824' }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Week view toggle — appears as the last "tab" on desktop */}
          <button
            onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
            className="hidden md:flex shrink-0 flex-col items-center justify-center gap-1 py-3 px-3 transition-colors font-mono text-[10px] uppercase tracking-wider"
            style={{
              color: viewMode === 'week' ? '#C09A3C' : '#6E6560',
              border: viewMode === 'week' ? '1px solid #C09A3C' : '1px solid #2C2824',
              whiteSpace: 'nowrap',
              marginLeft: '8px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7 }}>
              <rect x="1" y="1" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="5.5" y="1" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="10" y="1" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="1" y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="5.5" y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="10" y="5.5" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="1" y="10" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="5.5" y="10" width="3" height="3" fill="currentColor" rx="0.5"/>
              <rect x="10" y="10" width="3" height="3" fill="currentColor" rx="0.5"/>
            </svg>
            Week
          </button>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {!hasAnySessions && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="font-mono text-sm text-smoke tracking-wider text-center">
            No classes match the current filter.
          </p>
          <button
            onClick={resetFilters}
            className="font-mono text-xs uppercase tracking-wider py-2 px-4 transition-colors"
            style={{ border: '1px solid #2C2824', color: '#6E6560' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── WEEK VIEW (desktop) ── */}
      {hasAnySessions && viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: '#2C2824' }}>
          {DAYS_ORDER.map((day) => {
            const sessions = getDaySessions(day);
            const today = isCurrentDay(day);
            return (
              <div
                key={day}
                className="p-3 min-h-48"
                style={{ backgroundColor: today ? '#0D0B09' : '#1A1714' }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-3 pb-2"
                  style={{
                    color: today ? '#C09A3C' : '#6E6560',
                    borderBottom: `1px solid ${today ? '#C09A3C' : '#2C2824'}`,
                  }}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                  {today && <span> ·</span>}
                </div>
                {sessions.length === 0 ? (
                  <div className="font-mono text-[10px] mt-2" style={{ color: '#2C2824' }}>—</div>
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
        <div>
          {/* Day header */}
          <div className="flex items-baseline gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid #2C2824' }}>
            <h3
              className="font-display text-3xl uppercase tracking-tight leading-none"
              style={{ color: isCurrentDay(activeDay) ? '#C09A3C' : '#EEE8DC' }}
            >
              {DAY_LABELS[activeDay]}
            </h3>
            {isCurrentDay(activeDay) && (
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: '#C09A3C' }}>
                Today
              </span>
            )}
            <span className="font-mono text-xs ml-auto" style={{ color: '#6E6560' }}>
              {getDaySessions(activeDay).length} classes
            </span>
          </div>

          {getDaySessions(activeDay).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="font-mono text-sm tracking-wider text-center" style={{ color: '#6E6560' }}>
                No classes on {DAY_LABELS[activeDay]} with the current filters.
              </p>
              <button
                onClick={resetFilters}
                className="font-mono text-xs uppercase tracking-wider py-2 px-4 transition-colors"
                style={{ border: '1px solid #2C2824', color: '#6E6560' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-px" style={{ backgroundColor: '#2C2824' }}>
              {getDaySessions(activeDay).map((session, i) => (
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EMBED DISCLAIMER ── */}
      {compact && filterDiscipline && (
        <p className="mt-4 font-mono text-[11px] tracking-wide" style={{ color: '#6E6560' }}>
          Times shown are placeholders. Confirm current schedule with the gym.
        </p>
      )}
    </div>
  );
}
