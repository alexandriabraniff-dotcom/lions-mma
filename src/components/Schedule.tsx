import React, { useState, useEffect, useRef } from 'react';
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
const HOUR_PX    = 64;
const TOTAL_H    = (END_HOUR - START_HOUR) * HOUR_PX;
const HOURS      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TIME_COL   = 56;

// ─── Discipline accent colours ────────────────────────────────────────────────

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

// ─── CustomSelect ─────────────────────────────────────────────────────────────

type SelectOption = { value: string; label: string; accent?: string };

function CustomSelect({
  options,
  value,
  onChange,
}: {
  options:  SelectOption[];
  value:    string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div ref={ref} style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:           '100%',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          gap:             '8px',
          padding:         '9px 14px',
          borderRadius:    '10px',
          backgroundColor: 'rgba(44,40,36,0.7)',
          border:          '1px solid rgba(255,255,255,0.08)',
          cursor:          'pointer',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition:      'border-color 0.15s ease',
        } as React.CSSProperties}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        <span style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '12px',
          fontWeight:    500,
          color:         'rgba(238,232,220,0.85)',
          letterSpacing: '0.01em',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
        }}>
          {selected.label}
        </span>
        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(138,132,128,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position:        'absolute',
            top:             'calc(100% + 6px)',
            left:            0,
            right:           0,
            zIndex:          100,
            borderRadius:    '12px',
            backgroundColor: 'rgba(26,23,20,0.96)',
            border:          '1px solid rgba(255,255,255,0.1)',
            backdropFilter:  'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:       '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            overflow:        'hidden',
            minWidth:        '160px',
          } as React.CSSProperties}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '10px',
                  padding:        '10px 14px',
                  textAlign:      'left',
                  backgroundColor: isSelected
                    ? 'rgba(192,154,60,0.12)'
                    : 'transparent',
                  borderBottom:   i < options.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
                  cursor:         'pointer',
                  transition:     'background-color 0.1s ease',
                } as React.CSSProperties}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                {/* Colour dot (if discipline option) */}
                {opt.accent && (
                  <span style={{
                    flexShrink:      0,
                    width:           7,
                    height:          7,
                    borderRadius:    '50%',
                    backgroundColor: opt.accent,
                    opacity:         isSelected ? 1 : 0.6,
                  }}/>
                )}
                <span style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '12px',
                  fontWeight:    isSelected ? 600 : 400,
                  color:         isSelected
                    ? (opt.accent ?? '#C09A3C')
                    : 'rgba(238,232,220,0.75)',
                  flex:          1,
                  letterSpacing: '0.01em',
                }}>
                  {opt.label}
                </span>
                {/* Checkmark */}
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 6L5 9L10 3" stroke="#C09A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
  const locShort  = locations.find(l => l.id === session.location)?.short    ?? session.location;
  const levelStr  = [...new Set(session.levels.map(getLevelLabel).filter(Boolean))].join(' / ');

  const top  = toPx(session.start) + 1;
  const h    = durPx(session.start, session.end) - 2;
  const lPct = (session.col  / session.totalCols) * 100;
  const wPct = (1            / session.totalCols) * 100;

  const bg     = `${accent}28`;
  const border = `${accent}55`;
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
        <span
          className="leading-tight font-semibold truncate"
          style={{
            fontSize:   inWeekView ? '11px' : '13px',
            color:      accent,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {name}
        </span>

        {h >= 22 && (
          <span
            className="leading-none font-normal truncate"
            style={{ fontSize: '10px', color: 'rgba(238,232,220,0.6)', fontFamily: "'Inter', sans-serif" }}
          >
            {fmt12h(session.start)}
          </span>
        )}

        {h >= 40 && levelStr && (
          <span
            className="leading-none truncate"
            style={{
              fontSize:   '10px',
              color:      accent,
              opacity:    0.85,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {levelStr}
          </span>
        )}

        {!inWeekView && showLocation && h >= 56 && (
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

        {!inWeekView && session.note && h >= 72 && (
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
}: {
  viewMode:       'week' | 'day';
  activeDay:      Day;
  todayDay:       Day;
  getGroupedDay:  (day: Day) => GroupedSession[];
  activeLocation: string;
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
    <div>
      {/* ── Sticky day-name header strip ── */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Spacer above time-label column */}
        <div style={{ width: TIME_COL, minWidth: TIME_COL, flexShrink: 0 }} />

        {/* One cell per visible day */}
        <div className="flex flex-1" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          {days.map((day, idx) => {
            const isToday = day === todayDay;
            return (
              <div
                key={day}
                className="flex-1 flex flex-col items-center justify-center"
                style={{
                  padding:         '10px 4px 9px',
                  borderRight:     '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isToday ? 'rgba(192,154,60,0.05)' : 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily:    "'Inter', sans-serif",
                    fontSize:      inWeekView ? '11px' : '15px',
                    fontWeight:    600,
                    letterSpacing: inWeekView ? '0.06em' : '0.08em',
                    textTransform: 'uppercase',
                    color:         isToday ? '#C09A3C' : 'rgba(238,232,220,0.75)',
                    lineHeight:    1,
                  } as React.CSSProperties}
                >
                  {inWeekView ? DAY_LABELS[day].slice(0, 3) : DAY_LABELS[day]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Time grid (full height, no inner scroll) ── */}
      <div>
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
                  top:      (h - START_HOUR) * HOUR_PX + 4,
                  fontSize: '10px',
                  color:    'rgba(138,132,128,0.55)',
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
            style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            {HOURS.map(h => (
              <div
                key={`h-${h}`}
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: (h - START_HOUR) * HOUR_PX, borderTop: '1px solid rgba(255,255,255,0.07)' }}
              />
            ))}

            {HOURS.map(h => (
              <div
                key={`hh-${h}`}
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2, borderTop: '1px solid rgba(255,255,255,0.03)' }}
              />
            ))}

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
                      borderRight:     '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: isToday ? 'rgba(192,154,60,0.03)' : 'transparent',
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
    </div>
  );
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export default function Schedule({ filterDiscipline, compact = false }: ScheduleProps) {
  const dayTabsRef = useRef<HTMLDivElement>(null);

  function getTodayDay(): Day {
    const m: Record<number, Day> = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
    return m[new Date().getDay()] ?? 'mon';
  }

  // Returns the calendar date (1–31) for each day of the current week
  function getWeekDates(): Record<Day, number> {
    const today   = new Date();
    const jsDay   = today.getDay(); // 0 = Sun
    const fromMon = jsDay === 0 ? 6 : jsDay - 1; // days since Monday
    const monday  = new Date(today);
    monday.setDate(today.getDate() - fromMon);
    const offsets: Record<Day, number> = { mon:0, tue:1, wed:2, thu:3, fri:4, sat:5, sun:6 };
    const result = {} as Record<Day, number>;
    for (const [day, offset] of Object.entries(offsets)) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + offset);
      result[day as Day] = d.getDate();
    }
    return result;
  }

  const [activeLocation,   setActiveLocation]   = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay,        setActiveDay]        = useState<Day>(getTodayDay);
  const [viewMode,         setViewMode]         = useState<'week' | 'day'>('day');

  useEffect(() => { setViewMode(window.innerWidth >= 1024 ? 'week' : 'day'); }, []);

  useEffect(() => {
    if (!dayTabsRef.current) return;
    const btn = dayTabsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeDay]);

  function isCurrentDay(day: Day) { return day === getTodayDay(); }

  const disc = filterDiscipline ?? activeDiscipline;

  const filtered = schedule.filter(s =>
    (activeLocation === 'all' || s.location === activeLocation) &&
    (disc === 'all'
      || (disc === 'womens' ? s.level === 'womens' : s.discipline === disc))
  );

  function getGroupedDay(day: Day): GroupedSession[] {
    return groupSessions(
      filtered.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start))
    );
  }

  const todayDay     = getTodayDay();
  const weekDates    = getWeekDates();
  const hasAny       = filtered.length > 0;
  const showControls = !(compact && filterDiscipline);

  // ── Dropdown options ──────────────────────────────────────────────────────

  const locationOptions: SelectOption[] = [
    { value: 'all',  label: 'Both Locations' },
    { value: '1256', label: '1256 Granville' },
    { value: '1133', label: '1133 Granville' },
  ];

  const disciplineOptions: SelectOption[] = [
    { value: 'all', label: 'All Classes' },
    ...disciplines
      .filter(d => d.id !== 'private')
      .map(d => ({ value: d.id, label: d.name, accent: ACCENT[d.id] ?? '#C09A3C' })),
  ];

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={compact ? '' : 'py-2'}
      style={{
        borderRadius: compact ? 0 : '16px',
        overflow:     compact ? undefined : 'hidden',
        border:       compact ? undefined : '1px solid rgba(255,255,255,0.1)',
        backgroundColor: compact ? undefined : 'rgba(22,19,16,0.7)',
        boxShadow:    compact ? undefined : '0 1px 0 rgba(255,255,255,0.04) inset',
      }}
    >

      {/* ── Controls ── */}
      {showControls && (
        <div
          className="flex items-center gap-2"
          style={{ padding: '14px 14px 0 14px' }}
        >
          {/* Location dropdown */}
          <CustomSelect
            options={locationOptions}
            value={activeLocation}
            onChange={v => setActiveLocation(v as 'all' | '1256' | '1133')}
          />

          {/* Discipline dropdown */}
          {!filterDiscipline && (
            <CustomSelect
              options={disciplineOptions}
              value={activeDiscipline}
              onChange={v => setActiveDiscipline(v)}
            />
          )}

          {/* Week view toggle */}
          <button
            onClick={() => setViewMode(v => v === 'week' ? 'day' : 'week')}
            className="hidden lg:flex shrink-0 items-center gap-2 transition-all"
            title={viewMode === 'week' ? 'Switch to day view' : 'Switch to week view'}
            style={{
              padding:         '9px 14px',
              borderRadius:    '10px',
              backgroundColor: viewMode === 'week'
                ? 'rgba(192,154,60,0.15)'
                : 'rgba(44,40,36,0.7)',
              border:          `1px solid ${viewMode === 'week' ? 'rgba(192,154,60,0.35)' : 'rgba(255,255,255,0.08)'}`,
              fontFamily:      "'Inter', sans-serif",
              fontSize:        '12px',
              fontWeight:      500,
              letterSpacing:   '0.01em',
              color:           viewMode === 'week' ? '#C09A3C' : 'rgba(138,132,128,0.8)',
              whiteSpace:      'nowrap',
              backdropFilter:  'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              cursor:          'pointer',
            } as React.CSSProperties}
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
      )}

      {/* ── Day navigation tabs ── */}
      <div
        className="flex items-stretch"
        style={{
          marginTop:    showControls ? '12px' : 0,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          borderTop:    showControls ? '1px solid rgba(255,255,255,0.06)' : undefined,
        }}
      >
        {/* Spacer — exactly TIME_COL wide */}
        <div className="shrink-0" style={{ width: TIME_COL }} />

        {/* Day tabs */}
        <div
          ref={dayTabsRef}
          className="flex flex-1 overflow-x-auto scrollbar-hide"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          {DAYS_ORDER.map(day => {
            const isActive = viewMode === 'day' && activeDay === day;
            const isToday  = isCurrentDay(day);
            const dateNum  = weekDates[day];
            return (
              <button
                key={day}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => { setActiveDay(day); setViewMode('day'); }}
                className="flex-1 shrink-0 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                style={{
                  minWidth:        '40px',
                  borderRight:     '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? 'rgba(192,154,60,0.08)' : 'transparent',
                  borderBottom:    isActive ? '2px solid #C09A3C' : '2px solid transparent',
                  transition:      'background-color 0.15s ease',
                }}
              >
                {/* Day abbreviation */}
                <span
                  className="font-mono uppercase leading-none"
                  style={{
                    fontSize:      '9px',
                    letterSpacing: '0.1em',
                    color:         isToday && !isActive ? '#C09A3C'
                                 : isActive             ? 'rgba(238,232,220,0.9)'
                                 : 'rgba(138,132,128,0.6)',
                  }}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </span>

                {/* Calendar date — circled on today */}
                <span
                  className="font-display leading-none"
                  style={{
                    fontSize:        '16px',
                    minWidth:        '28px',
                    textAlign:       'center',
                    borderRadius:    '100px',
                    padding:         '1px 4px',
                    backgroundColor: isToday && !isActive ? '#C09A3C' : 'transparent',
                    color:           isToday && !isActive ? '#0D0B09'
                                   : isActive             ? '#C09A3C'
                                   : 'rgba(238,232,220,0.8)',
                    transition:      'color 0.15s ease',
                  }}
                >
                  {dateNum}
                </span>
              </button>
            );
          })}
        </div>
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
              cursor:          'pointer',
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
