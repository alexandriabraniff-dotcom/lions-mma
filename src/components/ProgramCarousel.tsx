import { useRef, useState, useEffect } from 'react';

const disciplines = [
  { id: 'muay-thai',    name: 'Muay Thai',        tagline: 'The Art of 8 Limbs',             slug: 'muay-thai',       img: 'https://picsum.photos/seed/mt1/800/1000' },
  { id: 'boxing',       name: 'Boxing',            tagline: 'The Sweet Science',              slug: 'boxing',          img: 'https://picsum.photos/seed/bx1/800/1000' },
  { id: 'bjj-gi',       name: 'BJJ (Gi)',          tagline: 'The Gentle Art',                 slug: 'bjj-gi',          img: 'https://picsum.photos/seed/gi1/800/1000' },
  { id: 'nogi',         name: 'No-Gi',             tagline: 'Submission Grappling',           slug: 'nogi',            img: 'https://picsum.photos/seed/ng1/800/1000' },
  { id: 'wrestling',    name: 'Wrestling',          tagline: 'Hardest Sport in the World',    slug: 'wrestling',       img: 'https://picsum.photos/seed/wr1/800/1000' },
  { id: 'mma',          name: 'MMA',               tagline: 'Train Like a Pro',               slug: 'mma',             img: 'https://picsum.photos/seed/mm1/800/1000' },
  { id: 'womens',       name: "Women's Only",       tagline: 'Safe, Inclusive, Empowering',   slug: 'womens-only',     img: 'https://picsum.photos/seed/wo1/800/1000' },
  { id: 'kids',         name: 'Kids',              tagline: 'Anti-Bullying, Respect, Values', slug: 'kids',            img: 'https://picsum.photos/seed/kd1/800/1000' },
  { id: 'private',      name: 'Private Training',  tagline: 'Level Up',                       slug: 'private-training',img: 'https://picsum.photos/seed/pv1/800/1000' },
];

export default function ProgramCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.floor(disciplines.length / 2)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scroll to center item on mount
    const items = Array.from(container.children) as HTMLElement[];
    const mid = items[activeIndex];
    if (mid) {
      container.scrollLeft =
        mid.offsetLeft - container.offsetWidth / 2 + mid.offsetWidth / 2;
    }

    function handleScroll() {
      const scrollCenter = container!.scrollLeft + container!.offsetWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      (Array.from(container!.children) as HTMLElement[]).forEach((el, i) => {
        const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - scrollCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const CARD_W = 'clamp(220px, 28vw, 300px)';
  const CARD_H = 'clamp(300px, 42vw, 420px)';

  return (
    <section style={{ padding: '64px 0 80px', backgroundColor: '#1A1714', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '0 24px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8480', marginBottom: '8px' }}>
          Disciplines
        </p>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#EEE8DC', lineHeight: 1 }}>
          PROGRAMS
        </h2>
      </div>

      {/* Carousel track */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          paddingLeft: 'max(32px, calc(50vw - 150px))',
          paddingRight: 'max(32px, calc(50vw - 150px))',
          gap: '14px',
          alignItems: 'center',
          paddingTop: '24px',
          paddingBottom: '24px',
          cursor: 'grab',
        } as React.CSSProperties}
        className="scrollbar-hide"
      >
        {disciplines.map((disc, i) => {
          const isActive = i === activeIndex;
          return (
            <a
              key={disc.id}
              href={`/programs/${disc.slug}`}
              style={{
                flexShrink: 0,
                width: CARD_W,
                height: CARD_H,
                scrollSnapAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transform: isActive ? 'scale(1.07)' : 'scale(0.88)',
                opacity: isActive ? 1 : 0.5,
                transition: 'transform 0.45s cubic-bezier(0.34,1.2,0.64,1), opacity 0.45s ease',
                display: 'block',
                textDecoration: 'none',
                cursor: 'pointer',
                zIndex: isActive ? 2 : 1,
                borderRadius: '3px',
                boxShadow: isActive ? '0 20px 60px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.3)',
              } as React.CSSProperties}
            >
              {/* Photo */}
              <img
                src={disc.img}
                alt={disc.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,11,9,0.96) 0%, rgba(13,11,9,0.45) 55%, rgba(13,11,9,0.1) 100%)' }} />

              {/* Active brass border */}
              {isActive && (
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(192,154,60,0.4)', pointerEvents: 'none', borderRadius: '3px' }} />
              )}

              {/* Content */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '22px 18px' }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C09A3C', marginBottom: '6px', opacity: isActive ? 1 : 0.7 }}>
                  {disc.tagline}
                </span>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 700, textTransform: 'uppercase', color: '#EEE8DC', lineHeight: 1, margin: 0 }}>
                  {disc.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#C09A3C', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Explore
                  </span>
                  <span style={{ color: '#C09A3C', fontSize: '13px' }}>&#8594;</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
        {disciplines.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === activeIndex ? '20px' : '6px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i === activeIndex ? '#C09A3C' : 'rgba(138,132,128,0.35)',
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}
