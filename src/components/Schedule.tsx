import React, { useState, useEffect, useRef, type RefObject } from 'react';
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

const START_HOUR = 6;
const END_HOUR   = 22;
const HOUR_PX    = 64;   // px per hour (1.067 px/min — rounder number for gaps)
const TOTAL_H    = (END_HOUR - START_HOUR) * HOUR_PX;
const HOURS      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TIME_COL   = 56;   // px — time-label column width

// ─── Discipline accent colours (slightly more saturated for the card fills) ───

const ACCENT: Record<string, string> = {
  'muay-thai':    '#C09A3C',
  'boxing':       '#A0845A',
  'dutch':        '#B08840',
  'bjj-gi':       '#5A8050',
  'nogi':         '#4A6E96',
  'wrestling':    '#9A5A48',
  'mma':          '#7050A0',
  'conditioning': '#608060',
  'womens':       '#AA5A84',
  'kids':         '#50907A',
  'private':      '#808060',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function toPx(t: string): number {
  return ((toMin(t) - START_HOUR * 60) / 60) * HOUR_PX;
}

function durPx(start: string, end: string): number {
  return Math.max(((toMin(end) - toMin(start)) / 60) * HOUR_PX, 26);
}

function fmt12h(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10), m = mStr ?? '00';
  if (h === 0)  return `12:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  return h < 12 ? `${h}:${m} AM` : `${h - 12}:${m} PM`;
}

function fmtHour(h: number): string {
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

function groupSessions(raw: ClassSession[]): GroupedSession[] {
  const map = new Map<string, GroupedSession>();
  for (const s of raw) {
    const key = `${s.start}|${s.discipline}|${s.location}|${s.note ?? ''}`;
    const ex = map.get(key);
    if (ex) {
      ex.levels.push(s.level);
      if (s.end > ex.end) ex.end = s.end;
    } else {
      const { level, ...rest } = s;
      map.set(key, { ...rest, levels: [level] });
    }
  }
  return Array.from(map.values());
}

// ─── Overlap layout ───────────────────────────────────────────────────────────

function layoutSessions(sessions: GroupedSession[]): LaidOutSession[] {
  const sorted = [...sessions].sort((a, b) => toMin(a.start) - toMin(b.start));
  const laid: LaidOutSession[] = sorted.map(s => ({ ...s, col: 0, totalCols: 1 }));
  const colEnds: number[] = [];
  for (const ev of laid) {
    const s = toMin(ev.start), e = toMin(ev.end);
    let col = 0;
    while (col < colEnds.length && colEnds[col] > s) col++;
    ev.col = col;
    colEnds[col] = e;
  }
  for (const ev of laid) {
    const s = toMin(ev.start), e = toMin(ev.end);
    let max = ev.col;
    for (const ov of laid) {
      if (toMin(ov.start) < e && toMin(ov.end) > s) max = Math.max(max, ov.col);
    }
    ev.totalCols = max + 1;
  }
  return laid;
}

// ─── EventBlock — Apple/ClassPass card style ──────────────────────────────────

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
  const accent    = ACCENT[session.discipline] ?? '#C09A3C';
  const name      = disciplines.find(d => d.id === session.discipline)?.name  ?? session.discipline;
  const short     = disciplines.find(d => d.id === session.discipline)?.short ?? session.discipline;
  const locShort  = locations.find(l => l.id === session.location)?.short    ?? session.location;
  const levelStr  = [...new Set(session.levels.map(getLevelLabel).filter(Boolean))].join(' / ');

  const top    = toPx(session.start) + 1;
  const h      = durPx(session.start, session.end) - 2;
  const lPct   = (session.col  / session.totalCols) * 100;
  const wPct   = (1            / session.totalCols) * 100;

  // Hex alpha helpers
  const bg     = `${accent}28`;    // ~16% fill
  const border = `${accent}55`;    // ~33% border
  const glow   = `${accent}40`;

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        top,
        height:       h,
        left:         `calc(${lPct}% + 2px)`,
        width:        `calc(${wPct}% - 4px)`,
        borderRadius: inWeekView ? '6px' : '8px',
        backgroundColor: bg,
        border:       `1px solid ${border}`,
        boxShadow:    isCurrent
          ? `0 0 0 2px ${glow}, 0 2px 12px ${glow}`
          : '0 1px 3px rgba(0,0,0,0.3)',
        transition:   'box-shadow 0.15s ease, transform 0.15s ease',
        cursor:       'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scaleY(1.005) scaleX(1.01)';
        (e.currentTarget as HTMLElement).style.zIndex = '10';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.zIndex = '';
      }}
    >
      <div
        className="h-full overflow-hidden flex flex-col"
        style={{ padding: inWeekView ? '5px 6px' : '7px 9px', gap: '2px' }}
      >
        {/* Class name */}
        <span
          className="leading-tight font-semibold truncate"
          style={{
            fontSize:   inWeekView ? '10px' : '12px',
            color:      accent,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {inWeekView ? short : name}
        </span>

        {/* Start time */}
        {h >= 32 && (
          <span
            className="leading-none font-normal truncate"
            style={{ fontSize: '10px', color: 'rgba(238,232,220,0.6)', fontFamily: "'Inter', sans-serif" }}
          >
            {fmt12h(session.start)}
          </span>
        )}

        {/* Level pill */}
        {!inWeekView && h >= 52 && levelStr && (
          <span
            className="leading-none truncate"
            style={{
              fontSize: '10px',
              color:    accent,
              opacity:  0.85,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {levelStr}
          </span>
        )}

        {/* Location */}
        {!inWeekView && showLocation && h >= 68 && (
          <span
            className="leading-none truncate"
            style={{
              fontSize:   '10px',
              color:      'rgba(238,232,220,0.45)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {locShort} Granville
          </span>
        )}

        {/* Note */}
        {!inWeekView && session.note && h >= 84 && (
          <span
            className="leading-none truncate"
            style={{ fontSize: '10px', color: accent, opacity: 0.75, fontFamily: "'Inter', sans-serif" }}
          >
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
  const inWeekView = viewMode === 'week';
  const days       = inWeekView ? DAYS_ORDER : [activeDay];

  const nowMin  = new Date().getHours() * 60 + new Date().getMinutes();
  const nowPx   = ((nowMin - START_HOUR * 60) / 60) * HOUR_PX;
  const showNow = nowMin >= START_HOUR * 60 && nowMin < END_HOUR * 60;

  function isCurrent(s: GroupedSession) {
    return s.day === todayDay && nowMin >= toMin(s.start) && nowMin < toMin(s.end);
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto scrollbar-hide"
      style={{
        maxHeight:          '660px',
        overscrollBehavior: 'contain',
        // Fade out the last 48px so the scroll end feels natural
        maskImage:          'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
        WebkitMaskImage:    'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
      } as React.CSSProperties}
    >
      <div className="flex" style={{ height: TOTAL_H, minHeight: TOTAL_H }}>

        {/* ── Time labels ── */}
        <div
          className="shrink-0 relative select-none"
          style={{ width: TIME_COL, minWidth: TIME_COL }}
        >
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute right-3 font-mono"
              style={{
                top:      (h - START_HOUR) * HOUR_PX - 7,
                fontSize: '10px',
                color:    'rgba(138,132,128,0.6)',
                letterSpacing: '0.03em',
              }}
            >
              {fmtHour(h)}
            </div>
          ))}
        </div>

        {/* ── Grid body ── */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Hour lines */}
          {HOURS.map(h => (
            <div
              key={`h-${h}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top:       (h - START_HOUR) * HOUR_PX,
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            />
          ))}

          {/* Half-hour lines */}
          {HOURS.map(h => (
            <div
              key={`hh-${h}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top:       (h - START_HOUR) * HOUR_PX + HOUR_PX / 2,
                borderTop: '1px solid rgba(255,255,255,0.025)',
              }}
            />
          ))}

          {/* Current-time indicator */}
          {showNow && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none"
              style={{ top: nowPx }}
            >
              <div
                style={{
                  height:          '1.5px',
                  backgroundColor: '#C09A3C',
                  boxShadow:       '0 0 6px #C09A3C88',
                  position:        'relative',
                }}
              >
                <div
                  style={{
                    position:        'absolute',
                    left:            -5,
                    top:             -4,
                    width:           10,
                    height:          10,
                    borderRadius:    '50%',
                    backgroundColor: '#C09A3C',
                    boxShadow:       '0 0 8px #C09A3C, 0 0 16px #C09A3C66',
                  }}
                />
              </div>
            </div>
          )}

          {/* Day columns */}
          <div className="flex absolute inset-0" style={{ height: TOTAL_H }}>
            {days.map(day => {
              const isToday  = day === todayDay;
              const sessions = layoutSessions(getGroupedDay(day));
              return (
                <div
                  key={day}
                  className="flex-1 relative"
                  style={{
                    borderRight:     '1px solid rgba(255,255,255,0.04)',
                    backgroundColor: isToday
                      ? 'rgba(192,154,60,0.03)'
                      : 'transparent',
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
  const dayTabsRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  function getTodayDay(): Day {
    const m: Record<number, Day> = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
    return m[new Date().getDay()] ?? 'mon';
  }

  const [activeLocation,   setActiveLocation]   = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay,        setActiveDay]        = useState<Day>(getTodayDay);
  const [viewMode,         setViewMode]         = useState<'week' | 'day'>('day');

  useEffect(() => { setViewMode(window.innerWidth >= 1024 ? 'week' : 'day'); }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const h = Math.max(START_HOUR, new Date().getHours() - 1);
    gridRef.current.scrollTop = (h - START_HOUR) * HOUR_PX;
  }, []);

  useEffect(() => {
    if (!dayTabsRef.current) return;
    const btn = dayTabsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeDay]);

  function isCurrentDay(day: Day) { return day === getTodayDay(); }

  const disc = filterDiscipline ?? activeDiscipline;

  const filtered = schedule.filter(s =>
    (activeLocation === 'all' || s.location === activeLocation) &&
    (disc === 'all' || s.discipline === disc)
  );

  function getGroupedDay(day: Day): GroupedSession[] {
    return groupSessions(
      filtered.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start))
    );
  }

  const todayDay     = getTodayDay();
  const hasAny       = filtered.length > 0;
  const showControls = !(compact && filterDiscipline);

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={compact ? '' : 'py-2'}
      style={{
        borderRadius: compact ? 0 : '16px',
        overflow:     compact ? undefined : 'hidden',
        border:       compact ? undefined : '1px solid rgba(255,255,255,0.06)',
        backgroundColor: compact ? undefined : 'rgba(26,23,20,0.5)',
      }}
    >

      {/* ── Controls ── */}
      {showControls && (
        <div
          className="space-y-3"
          style={{ padding: '16px 16px 0 16px' }}
        >
          {/* Location — pill buttons with gap */}
          <div className="flex gap-2">
            {(['all', '1256', '1133'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className="font-mono text-xs tracking-wider uppercase transition-all"
                style={{
                  flex:            loc === 'all' ? '1 1 auto' : '0 0 auto',
                  padding:         '8px 20px',
                  borderRadius:    '100px',
                  backgroundColor: activeLocation === loc ? '#C09A3C' : 'rgba(44,40,36,0.8)',
                  color:           activeLocation === loc ? '#0D0B09' : 'rgba(138,132,128,0.9)',
                  border:          `1px solid ${activeLocation === loc ? '#C09A3C' : 'rgba(255,255,255,0.08)'}`,
                  fontWeight:      activeLocation === loc ? 600 : 400,
                  transition:      'all 0.2s ease',
                }}
              >
                {loc === 'all' ? 'All Locations' : `${loc} Granville`}
              </button>
            ))}
          </div>

          {/* Discipline chips — pill style */}
          {!filterDiscipline && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ overflowX: 'auto' } as React.CSSProperties}
            >
              <button
                onClick={() => setActiveDiscipline('all')}
                className="shrink-0 font-mono text-xs tracking-wider uppercase transition-all whitespace-nowrap"
                style={{
                  padding:         '6px 14px',
                  borderRadius:    '100px',
                  backgroundColor: activeDiscipline === 'all' ? '#C09A3C' : 'rgba(44,40,36,0.8)',
                  color:           activeDiscipline === 'all' ? '#0D0B09' : 'rgba(138,132,128,0.9)',
                  border:          `1px solid ${activeDiscipline === 'all' ? '#C09A3C' : 'rgba(255,255,255,0.08)'}`,
                  transition:      'all 0.2s ease',
                }}
              >
                All
              </button>
              {disciplines.filter(d => d.id !== 'private').map(d => {
                const accent   = ACCENT[d.id] ?? '#C09A3C';
                const isActive = activeDiscipline === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDiscipline(d.id)}
                    className="shrink-0 flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase transition-all whitespace-nowrap"
                    style={{
                      padding:         '6px 14px',
                      borderRadius:    '100px',
                      backgroundColor: isActive ? `${accent}30` : 'rgba(44,40,36,0.8)',
                      color:           isActive ? accent : 'rgba(138,132,128,0.9)',
                      border:          `1px solid ${isActive ? `${accent}70` : 'rgba(255,255,255,0.08)'}`,
                      transition:      'all 0.2s ease',
                    }}
                  >
                    <span
                      className="shrink-0 rounded-full"
                      style={{ width: 6, height: 6, backgroundColor: accent, opacity: isActive ? 1 : 0.5 }}
                    />
                    {d.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Calendar header: day tabs + week toggle ── */}
      <div
        className="flex items-stretch"
        style={{
          marginTop:    showControls ? '12px' : 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding:      '0 4px',
        }}
      >
        {/* Spacer aligning with time-label column */}
        <div className="shrink-0" style={{ width: TIME_COL - 4 }} />

        {/* Day tabs */}
        <div
          ref={dayTabsRef}
          className="flex flex-1 overflow-x-auto scrollbar-hide"
        >
          {DAYS_ORDER.map(day => {
            const isActive = viewMode === 'day' && activeDay === day;
            const isToday  = isCurrentDay(day);
            const count    = getGroupedDay(day).length;
            return (
              <button
                key={day}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => { setActiveDay(day); setViewMode('day'); }}
                className="flex-1 shrink-0 flex flex-col items-center justify-center gap-1.5 py-3 transition-colors"
                style={{ minWidth: '48px', maxWidth: '76px' }}
              >
                {/* Day abbreviation */}
                <span
                  className="font-mono uppercase leading-none"
                  style={{
                    fontSize:      '10px',
                    letterSpacing: '0.08em',
                    color:         isToday && !isActive ? '#C09A3C'
                                 : isActive ? 'rgba(238,232,220,0.9)'
                                 : 'rgba(138,132,128,0.7)',
                  }}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </span>

                {/* Count — pill background on active, brass dot on today */}
                <span
                  className="font-display leading-none"
                  style={{
                    fontSize:        '17px',
                    minWidth:        '28px',
                    textAlign:       'center',
                    borderRadius:    '100px',
                    padding:         '1px 6px',
                    backgroundColor: isActive
                      ? '#C09A3C'
                      : 'transparent',
                    color:           isActive ? '#0D0B09'
                                   : isToday  ? '#C09A3C'
                                   : count > 0 ? 'rgba(238,232,220,0.85)'
                                   : 'rgba(44,40,36,0.9)',
                    transition:     'all 0.2s ease',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Week view toggle */}
        <button
          onClick={() => setViewMode(v => v === 'week' ? 'day' : 'week')}
          className="hidden lg:flex shrink-0 items-center gap-2 px-4 transition-all whitespace-nowrap"
          style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '11px',
            letterSpacing: '0.04em',
            color:         viewMode === 'week' ? '#C09A3C' : 'rgba(138,132,128,0.7)',
            borderLeft:    '1px solid rgba(255,255,255,0.06)',
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
        <div className="flex flex-col items-center justify-center gap-4" style={{ padding: '64px 24px' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(138,132,128,0.7)', letterSpacing: '0.02em' }}>
            No classes match this filter.
          </p>
          <button
            onClick={() => { setActiveLocation('all'); setActiveDiscipline('all'); setActiveDay(getTodayDay()); }}
            style={{
              fontFamily:      "'Inter', sans-serif",
              fontSize:        '12px',
              letterSpacing:   '0.04em',
              padding:         '8px 20px',
              borderRadius:    '100px',
              border:          '1px solid rgba(255,255,255,0.1)',
              color:           'rgba(138,132,128,0.8)',
              backgroundColor: 'transparent',
            }}
          >
            Reset filters
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
        <p
          style={{
            margin:      '12px 16px 16px',
            fontFamily:  "'Inter', sans-serif",
            fontSize:    '11px',
            color:       'rgba(138,132,128,0.55)',
            letterSpacing: '0.02em',
          }}
        >
          Times are subject to change. Confirm with the gym before visiting.
        </p>
      )}
    </div>
  );
}
