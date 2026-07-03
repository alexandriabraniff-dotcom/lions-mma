import React, { useState, useEffect, useRef, useId } from 'react';
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
  // Post-process: if a 1133 session ended up left of an overlapping 1256 session,
  // swap their columns so 1256 is always visually left of 1133 — but only if the
  // swap won't cause either session to collide with a third session in its new column.
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of laid) {
      if (a.location !== '1133') continue;
      for (const b of laid) {
        if (b.location !== '1256') continue;
        const overlaps = toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
        if (!overlaps || a.col >= b.col) continue;
        // Check whether swapping would create a collision with any third session
        const wouldCollide = laid.some(s =>
          s !== a && s !== b && (
            (s.col === b.col && toMin(a.start) < toMin(s.end) && toMin(s.start) < toMin(a.end)) ||
            (s.col === a.col && toMin(b.start) < toMin(s.end) && toMin(s.start) < toMin(b.end))
          )
        );
        if (!wouldCollide) {
          [a.col, b.col] = [b.col, a.col];
          changed = true;
        }
      }
    }
  }
  return laid;
}

// ─── CustomSelect ─────────────────────────────────────────────────────────────

type SelectOption = { value: string; label: string; accent?: string };

function CustomSelect({
  options,
  value,
  onChange,
  label,
}: {
  options:  SelectOption[];
  value:    string;
  onChange: (v: string) => void;
  label:    string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault(); setOpen(true); return;
    }
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (idx < options.length - 1) onChange(options[idx + 1].value); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); if (idx > 0) onChange(options[idx - 1].value); }
      if (e.key === 'Enter')     { setOpen(false); }
    }
  }

  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div ref={ref} style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`${label}: ${selected.label}`}
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
          id={listboxId}
          role="listbox"
          aria-label={label}
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
                role="option"
                aria-selected={isSelected}
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

// ─── ClassModal ───────────────────────────────────────────────────────────────

function ClassModal({
  session,
  onClose,
}: {
  session: LaidOutSession;
  onClose: () => void;
}) {
  const accent   = ACCENT[session.discipline] ?? '#C09A3C';
  const disc     = disciplines.find(d => d.id === session.discipline);
  const name     = disc?.name ?? session.discipline;
  const slug     = disc?.slug ?? session.discipline;
  const locObj   = locations.find(l => l.id === session.location);
  const locLabel = locObj ? locObj.address : session.location;
  const levelStr = [...new Set(session.levels.map(getLevelLabel).filter(Boolean))].join(' / ');
  const headingId = useId();

  const panelRef   = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Save focus, move to close button on open, restore on close
  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();
    return () => { prevFocusRef.current?.focus(); };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus trap
  function handlePanelKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <>
      <style>{`
        @keyframes modalFadeIn   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn  { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    <div
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          1000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter:  'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px',
        animation:       'modalFadeIn 0.2s ease forwards',
      } as React.CSSProperties}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        onKeyDown={handlePanelKeyDown}
        style={{
          width:           '100%',
          maxWidth:        'min(480px, calc(100vw - 32px))',
          backgroundColor: '#1A1714',
          borderRadius:    '16px',
          border:          `1px solid ${accent}30`,
          boxShadow:       `0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px ${accent}15`,
          overflow:        'hidden',
          animation:       'modalSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
        } as React.CSSProperties}
      >
        {/* Accent bar */}
        <div style={{ height: '3px', backgroundColor: accent, opacity: 0.8 }} />

        <div style={{ padding: '20px 24px 28px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, marginBottom: '4px' }}>
                {disc?.tagline ?? 'Class'}
              </p>
              <h3 id={headingId} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '28px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#EEE8DC', lineHeight: 1 }}>
                {name}
              </h3>
            </div>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close class details"
              style={{ flexShrink: 0, marginTop: '2px', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="rgba(238,232,220,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke={accent} strokeWidth="1.3"/>
                  <path d="M7 4V7L9 9" stroke={accent} strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#EEE8DC' }}>
                  {fmt12h(session.start)} – {fmt12h(session.end)}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(138,132,128,0.8)', marginTop: '1px' }}>Class time</p>
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5C5 1.5 3.5 3 3.5 5C3.5 7.5 7 12.5 7 12.5C7 12.5 10.5 7.5 10.5 5C10.5 3 9 1.5 7 1.5Z" stroke={accent} strokeWidth="1.3"/>
                  <circle cx="7" cy="5" r="1.3" fill={accent}/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#EEE8DC' }}>{locLabel}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(138,132,128,0.8)', marginTop: '1px' }}>Location</p>
              </div>
            </div>

            {/* Level */}
            {levelStr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1.5" y="8.5" width="2.5" height="4" rx="0.5" fill={accent}/>
                    <rect x="5.75" y="5.5" width="2.5" height="7" rx="0.5" fill={accent}/>
                    <rect x="10" y="2.5" width="2.5" height="10" rx="0.5" fill={accent}/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#EEE8DC' }}>{levelStr}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(138,132,128,0.8)', marginTop: '1px' }}>Level</p>
                </div>
              </div>
            )}

            {/* Note */}
            {session.note && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke={accent} strokeWidth="1.3"/>
                    <path d="M4.5 5H9.5M4.5 7H8" stroke={accent} strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#EEE8DC' }}>{session.note}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(138,132,128,0.8)', marginTop: '1px' }}>Note</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href={`/programs/${slug}`}
            style={{
              display:         'block',
              marginTop:       '24px',
              padding:         '13px 24px',
              borderRadius:    '10px',
              backgroundColor: accent,
              color:           '#0D0B09',
              fontFamily:      "'Barlow Condensed', sans-serif",
              fontSize:        '14px',
              fontWeight:      700,
              letterSpacing:   '0.08em',
              textTransform:   'uppercase',
              textAlign:       'center',
              textDecoration:  'none',
              transition:      'opacity 0.15s ease',
              cursor:          'pointer',
            } as React.CSSProperties}
          >
            Learn More About {name}
          </a>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── EventBlock — Apple/ClassPass card style ──────────────────────────────────

function EventBlock({
  session,
  isCurrent,
  showLocation,
  inWeekView,
  onSelect,
}: {
  session:      LaidOutSession;
  isCurrent:    boolean;
  showLocation: boolean;
  inWeekView:   boolean;
  onSelect:     () => void;
}) {
  const accent    = ACCENT[session.discipline] ?? '#C09A3C';
  const name      = disciplines.find(d => d.id === session.discipline)?.name  ?? session.discipline;
  const locShort  = locations.find(l => l.id === session.location)?.address  ?? session.location;
  const levelStr  = [...new Set(session.levels.map(getLevelLabel).filter(Boolean))].join(' / ');

  const top  = toPx(session.start) + 1;
  const h    = durPx(session.start, session.end) - 2;
  const lPct = (session.col  / session.totalCols) * 100;
  const wPct = (1            / session.totalCols) * 100;

  const bg     = `${accent}28`;
  const border = `${accent}55`;
  const glow   = `${accent}40`;

  const ariaLabel = `${name}, ${fmt12h(session.start)} to ${fmt12h(session.end)}, ${locShort}${levelStr ? `, ${levelStr}` : ''}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
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
        cursor:       'pointer',
      }}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
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
            {locShort}
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
  allSessionsForDay,
  onSelect,
}: {
  viewMode:           'week' | 'day';
  activeDay:          Day;
  todayDay:           Day;
  getGroupedDay:      (day: Day) => GroupedSession[];
  activeLocation:     string;
  allSessionsForDay:  (day: Day) => GroupedSession[];
  onSelect:           (s: LaidOutSession) => void;
}) {
  const inWeekView = viewMode === 'week';
  const days       = inWeekView ? DAYS_ORDER : [activeDay];

  const _vanNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
  const nowMin  = _vanNow.getHours() * 60 + _vanNow.getMinutes();
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
          {days.map(day => {
            const isToday = day === todayDay;
            const count   = allSessionsForDay(day).length;
            return (
              <div
                key={day}
                className="flex-1 flex flex-col items-center justify-center"
                style={{
                  padding:         '8px 4px 7px',
                  borderRight:     '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isToday ? 'rgba(192,154,60,0.05)' : 'transparent',
                  gap:             '2px',
                }}
              >
                {/* Label */}
                <span style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '9px',
                  fontWeight:    500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color:         isToday ? 'rgba(192,154,60,0.7)' : 'rgba(138,132,128,0.5)',
                  lineHeight:    1,
                } as React.CSSProperties}>
                  # classes
                </span>
                {/* Count */}
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize:   inWeekView ? '14px' : '18px',
                  fontWeight: 600,
                  color:      isToday ? '#C09A3C' : 'rgba(238,232,220,0.8)',
                  lineHeight: 1,
                }}>
                  {count}
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
                        onSelect={() => onSelect(s)}
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
  const dayTabsRef  = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  function getVancouverNow(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Vancouver' }));
  }

  function getTodayDay(): Day {
    const m: Record<number, Day> = { 0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat' };
    return m[getVancouverNow().getDay()] ?? 'mon';
  }

  // Returns the calendar date (1–31) for each day of the current week
  function getWeekDates(): Record<Day, number> {
    const today   = getVancouverNow();
    const jsDay   = today.getDay();
    const fromMon = jsDay === 0 ? 6 : jsDay - 1;
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

  // Returns "Wednesday, July 1" for a given Day
  function getFullDateLabel(day: Day): string {
    const today   = getVancouverNow();
    const jsDay   = today.getDay();
    const fromMon = jsDay === 0 ? 6 : jsDay - 1;
    const monday  = new Date(today);
    monday.setDate(today.getDate() - fromMon);
    const offsets: Record<Day, number> = { mon:0, tue:1, wed:2, thu:3, fri:4, sat:5, sun:6 };
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsets[day]);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  const [activeLocation,   setActiveLocation]   = useState<'all' | '1256' | '1133'>('all');
  const [activeDiscipline, setActiveDiscipline] = useState<string>('all');
  const [activeDay,        setActiveDay]        = useState<Day>(getTodayDay);
  const [viewMode,         setViewMode]         = useState<'week' | 'day'>('day');
  const [isMobile,         setIsMobile]         = useState(false);
  const [selected,         setSelected]         = useState<LaidOutSession | null>(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setViewMode(mobile ? 'day' : 'week');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!dayTabsRef.current) return;
    const btn = dayTabsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (btn) {
      const container = dayTabsRef.current;
      container.scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
    }
  }, [activeDay]);

  function isCurrentDay(day: Day) { return day === getTodayDay(); }

  // Day navigation helpers
  function prevDay() {
    const idx = DAYS_ORDER.indexOf(activeDay);
    if (idx > 0) setActiveDay(DAYS_ORDER[idx - 1]);
  }
  function nextDay() {
    const idx = DAYS_ORDER.indexOf(activeDay);
    if (idx < DAYS_ORDER.length - 1) setActiveDay(DAYS_ORDER[idx + 1]);
  }
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 44) return;
    if (delta < 0) nextDay();
    if (delta > 0) prevDay();
  }

  const disc = filterDiscipline ?? activeDiscipline;

  const filtered = schedule.filter(s =>
    (activeLocation === 'all' || s.location === activeLocation) &&
    (disc === 'all'
      || (disc === 'womens' ? s.level === 'womens' : s.discipline === disc))
  );

  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    setAnnouncement('');
    const t = setTimeout(() => {
      setAnnouncement(`Showing ${filtered.length} class${filtered.length !== 1 ? 'es' : ''}`);
    }, 150);
    return () => clearTimeout(t);
  }, [activeLocation, activeDiscipline, activeDay, filterDiscipline, filtered.length]);

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
    { value: '1256', label: '1256 Granville St' },
    { value: '1133', label: '1133 Granville St' },
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

      {/* Screen-reader live region for filter announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>

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
            label="Location"
          />

          {/* Discipline dropdown */}
          {!filterDiscipline && (
            <CustomSelect
              options={disciplineOptions}
              value={activeDiscipline}
              onChange={v => setActiveDiscipline(v)}
              label="Discipline"
            />
          )}

          {/* Week view toggle */}
          <button
            onClick={() => setViewMode(v => v === 'week' ? 'day' : 'week')}
            className="hidden lg:flex shrink-0 items-center gap-2 transition-all"
            aria-pressed={viewMode === 'week'}
            aria-label={viewMode === 'week' ? 'Switch to day view' : 'Switch to week view'}
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

      {/* ── Day navigation ── */}
      {isMobile ? (
        /* ── Mobile: horizontal date chip strip ── */
        <div
          style={{
            marginTop:    showControls ? '12px' : 0,
            borderTop:    showControls ? '1px solid rgba(255,255,255,0.06)' : undefined,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Date chips */}
          <div
            ref={dayTabsRef}
            className="flex overflow-x-auto scrollbar-hide gap-2"
            style={{ padding: '12px 16px' }}
          >
            {DAYS_ORDER.map(day => {
              const isActive = activeDay === day;
              const isToday  = isCurrentDay(day);
              const dateNum  = weekDates[day];
              return (
                <button
                  key={day}
                  data-active={isActive ? 'true' : 'false'}
                  aria-label={`${DAY_LABELS[day]}, ${dateNum}${isActive ? ' (selected)' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveDay(day)}
                  className="shrink-0 flex flex-col items-center gap-1"
                  style={{
                    minWidth:   '44px',
                    padding:    '6px 4px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'rgba(192,154,60,0.15)' : 'transparent',
                    border:     isActive ? '1px solid rgba(192,154,60,0.4)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontFamily:    "'Inter', sans-serif",
                    fontSize:      '10px',
                    fontWeight:    500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color:         isActive ? '#C09A3C' : 'rgba(138,132,128,0.6)',
                    lineHeight:    1,
                  } as React.CSSProperties}>
                    {DAY_LABELS[day].slice(0, 1)}
                  </span>
                  <span style={{
                    fontFamily:      "'Inter', sans-serif",
                    fontSize:        '18px',
                    fontWeight:      600,
                    lineHeight:      1,
                    width:           '32px',
                    height:          '32px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    borderRadius:    '50%',
                    backgroundColor: isActive             ? '#C09A3C'
                                   : isToday && !isActive ? 'rgba(192,154,60,0.2)'
                                   : 'transparent',
                    color:           isActive ? '#0D0B09'
                                   : isToday  ? '#C09A3C'
                                   : 'rgba(238,232,220,0.85)',
                    border:          isToday && !isActive ? '1.5px solid #C09A3C' : 'none',
                    transition:      'all 0.15s ease',
                  } as React.CSSProperties}>
                    {dateNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active day heading */}
          <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      '13px',
              fontWeight:    600,
              color:         'rgba(238,232,220,0.9)',
              letterSpacing: '0.01em',
            }}>
              {getFullDateLabel(activeDay)}
            </span>
            {/* Prev / next arrows */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['prev', 'next'] as const).map(dir => (
                <button
                  key={dir}
                  aria-label={dir === 'prev' ? 'Previous day' : 'Next day'}
                  onClick={dir === 'prev' ? prevDay : nextDay}
                  disabled={dir === 'prev' ? DAYS_ORDER.indexOf(activeDay) === 0 : DAYS_ORDER.indexOf(activeDay) === DAYS_ORDER.length - 1}
                  style={{
                    width:           '44px',
                    height:          '44px',
                    borderRadius:    '50%',
                    backgroundColor: 'rgba(44,40,36,0.7)',
                    border:          '1px solid rgba(255,255,255,0.08)',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    opacity:         (dir === 'prev' ? DAYS_ORDER.indexOf(activeDay) === 0 : DAYS_ORDER.indexOf(activeDay) === DAYS_ORDER.length - 1) ? 0.3 : 1,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    {dir === 'prev'
                      ? <path d="M6.5 2L3.5 5L6.5 8" stroke="rgba(238,232,220,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      : <path d="M3.5 2L6.5 5L3.5 8" stroke="rgba(238,232,220,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    }
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Desktop: full tab row ── */
        <div
          className="flex items-stretch"
          style={{
            marginTop:    showControls ? '12px' : 0,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            borderTop:    showControls ? '1px solid rgba(255,255,255,0.06)' : undefined,
          }}
        >
          <div className="shrink-0" style={{ width: TIME_COL }} />
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
                  aria-label={`${DAY_LABELS[day]}, ${dateNum}${isActive ? ' (selected)' : ''}`}
                  aria-pressed={isActive}
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
                  <span className="font-mono uppercase leading-none" style={{
                    fontSize: '9px', letterSpacing: '0.1em',
                    color: isToday && !isActive ? '#C09A3C' : isActive ? 'rgba(238,232,220,0.9)' : 'rgba(138,132,128,0.6)',
                  }}>
                    {DAY_LABELS[day].slice(0, 3)}
                  </span>
                  <span className="font-display leading-none" style={{
                    fontSize: '16px', minWidth: '28px', textAlign: 'center',
                    borderRadius: '100px', padding: '1px 4px',
                    backgroundColor: isToday && !isActive ? '#C09A3C' : 'transparent',
                    color: isToday && !isActive ? '#0D0B09' : isActive ? '#C09A3C' : 'rgba(238,232,220,0.8)',
                    transition: 'color 0.15s ease',
                  }}>
                    {dateNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          <TimeGrid
            viewMode={viewMode}
            activeDay={activeDay}
            todayDay={todayDay}
            getGroupedDay={getGroupedDay}
            activeLocation={activeLocation}
            allSessionsForDay={getGroupedDay}
            onSelect={s => setSelected(s)}
          />
        </div>
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

      {/* ── Class detail modal ── */}
      {selected && (
        <ClassModal
          session={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
