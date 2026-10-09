import { ChatCircleDots, List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAsk } from "./AskChhat";
import { Logo } from "./ui";

const LINKS = [
  { to: "/report", label: "Roof Report" },
  { to: "/quote", label: "Quote Check" },
  { to: "/bill", label: "Bill Audit" },
  { to: "/built-with-ai", label: "Built with AI" },
];

export function Nav() {
  const { open } = useAsk();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setMenu(false), [loc.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (loc.pathname.startsWith("/deck")) return null;
  return (
    <header className={`nav no-print${scrolled ? " nav--scrolled" : ""}${loc.pathname === "/" ? " nav--home" : ""}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo" aria-label="Chhat home">
          <Logo />
        </Link>
        <nav className="nav__links" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav__right">
          <button type="button" className="btn btn--sm btn--accent nav__ask" onClick={() => open()}>
            <ChatCircleDots size={18} weight="bold" /> Ask Chhat
          </button>
          <button type="button" className="icon-btn nav__burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {menu ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <div className="nav__sheet">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav__sheet-link">
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/deck" className="nav__sheet-link">
            Pitch deck
          </NavLink>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const loc = useLocation();
  if (loc.pathname.startsWith("/deck")) return null;
  return (
    <footer className="footer no-print">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <span className="footer__deva deva" aria-hidden="true">
            छत
          </span>
          <p>Solar, without the sales pitch. An independent advisor for Indian homes, built for the HackIndia AI-First Startup Hackathon 2026.</p>
        </div>
        <div className="footer__cols">
          <div>
            <p className="eyebrow">Tools</p>
            <Link to="/report">Roof Report</Link>
            <Link to="/quote">Quote Check</Link>
            <Link to="/bill">Bill Audit</Link>
            <Link to="/ask">Ask Chhat</Link>
          </div>
          <div>
            <p className="eyebrow">Company</p>
            <Link to="/built-with-ai">Built with AI</Link>
            <Link to="/deck">Pitch deck</Link>
            <a href="#/" onClick={(e) => { e.preventDefault(); document.getElementById("installers")?.scrollIntoView(); }}>For installers</a>
          </div>
          <div>
            <p className="eyebrow">Data</p>
            <a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer">NASA POWER</a>
            <a href="https://www.pmsuryaghar.gov.in/" target="_blank" rel="noreferrer">PM Surya Ghar</a>
            <a href="https://cea.nic.in/" target="_blank" rel="noreferrer">CEA</a>
          </div>
        </div>
      </div>
      <div className="wrap footer__legal">
        <span>Estimates, not financial advice. Check every figure with your DISCOM and bank.</span>
        <span className="mono">Sample documents are fictional.</span>
      </div>
    </footer>
  );
}
