import { useState, useEffect } from "react";

const programs = [
  { label: "Muay Thai", href: "/programs/muay-thai" },
  { label: "Boxing", href: "/programs/boxing" },
  { label: "BJJ (Gi)", href: "/programs/bjj-gi" },
  { label: "No-Gi", href: "/programs/nogi" },
  { label: "Wrestling", href: "/programs/wrestling" },
  { label: "MMA", href: "/programs/mma" },
  { label: "Women's Only", href: "/programs/womens-only" },
  { label: "Kids", href: "/programs/kids" },
  { label: "Private Training", href: "/programs/private-training" },
];

const aboutLinks = [
  { label: "Team", href: "/team" },
  { label: "Testimonials", href: "/faq" },
  { label: "FAQ", href: "/faq" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Memberships", href: "/pricing" },
  { label: "Find Us", href: "/contact" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setProgramsOpen(false);
    setAboutOpen(false);
  };

  return (
    <>
      {/* Hamburger / Close button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="relative z-[60] flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
      >
        <span
          className="block h-[2px] bg-canvas transition-all duration-200"
          style={{
            width: "22px",
            transform: isOpen ? "translateY(7px) rotate(45deg)" : "none",
          }}
        />
        <span
          className="block h-[2px] bg-canvas transition-all duration-200"
          style={{
            width: "22px",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          className="block h-[2px] bg-canvas transition-all duration-200"
          style={{
            width: "22px",
            transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none",
          }}
        />
      </button>

      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-50 bg-void flex flex-col"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: prefersReducedMotion ? "none" : "transform 300ms ease",
        }}
        aria-hidden={!isOpen}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-iron">
          <a
            href="/"
            onClick={close}
            className="font-display text-canvas text-2xl tracking-tight"
          >
            LIONS MMA
          </a>
          <button
            onClick={close}
            aria-label="Close menu"
            className="flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
          >
            <span
              className="block h-[2px] bg-canvas"
              style={{ width: "22px", transform: "translateY(7px) rotate(45deg)" }}
            />
            <span
              className="block h-[2px] bg-canvas"
              style={{ width: "22px", transform: "translateY(-7px) rotate(-45deg)" }}
            />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-2">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="font-display text-4xl text-canvas uppercase leading-tight hover:text-brass transition-colors"
              style={
                prefersReducedMotion
                  ? {}
                  : {
                      transitionDelay: isOpen ? `${i * 40}ms` : "0ms",
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(20px)",
                      transition: prefersReducedMotion
                        ? "none"
                        : `opacity 300ms ease ${i * 40}ms, transform 300ms ease ${i * 40}ms`,
                    }
              }
            >
              {link.label}
            </a>
          ))}

          {/* Programs expandable */}
          <div>
            <button
              onClick={() => setProgramsOpen((prev) => !prev)}
              className="font-display text-4xl text-canvas uppercase leading-tight hover:text-brass transition-colors flex items-center gap-3 w-full text-left"
              style={
                prefersReducedMotion
                  ? {}
                  : {
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(20px)",
                      transition: prefersReducedMotion
                        ? "none"
                        : `opacity 300ms ease ${navLinks.length * 40}ms, transform 300ms ease ${navLinks.length * 40}ms`,
                    }
              }
            >
              Programs
              <svg
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: programsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {programsOpen && (
              <div className="ml-4 mt-3 flex flex-col gap-2 border-l border-iron pl-4">
                {programs.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    onClick={close}
                    className="font-body text-lg text-canvas/70 hover:text-brass transition-colors uppercase tracking-wide"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* About Us expandable */}
          <div>
            <button
              onClick={() => setAboutOpen((prev) => !prev)}
              className="font-display text-4xl text-canvas uppercase leading-tight hover:text-brass transition-colors flex items-center gap-3 w-full text-left"
              style={
                prefersReducedMotion
                  ? {}
                  : {
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(20px)",
                      transition: prefersReducedMotion
                        ? "none"
                        : `opacity 300ms ease ${(navLinks.length + 1) * 40}ms, transform 300ms ease ${(navLinks.length + 1) * 40}ms`,
                    }
              }
            >
              About Us
              <svg
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: aboutOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {aboutOpen && (
              <div className="ml-4 mt-3 flex flex-col gap-2 border-l border-iron pl-4">
                {aboutLinks.map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    onClick={close}
                    className="font-body text-lg text-canvas/70 hover:text-brass transition-colors uppercase tracking-wide"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom CTA */}
        <div className="px-6 py-8 border-t border-iron flex flex-col gap-4">
          <a
            href="/free-trial"
            onClick={close}
            className="block w-full text-center bg-brass text-void font-display text-2xl uppercase tracking-wide py-4 hover:brightness-110 transition"
          >
            Train Free · 7 Days
          </a>
          <a
            href="tel:+16046840991"
            className="text-center font-mono text-sm text-smoke hover:text-canvas transition"
          >
            +1 604-684-0991
          </a>
        </div>
      </div>
    </>
  );
}
