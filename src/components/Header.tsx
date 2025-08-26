import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useEffect, useRef, useState } from 'react';

const Header = () => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al navegar
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Cerrar con click fuera y tecla Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (e.target instanceof Node && dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <header className="app-header">
      <div className="header-content">
  <Link to="/" className="home-link">MathRaining</Link>
        <nav className="desktop-nav">
          <Link to="/stats">Stats</Link>
          <Link to="/about">About</Link>
          <a href="https://github.com/EasyModeLife/TheMathGames" target="_blank" rel="noopener noreferrer">GitHub</a>
          <ThemeSwitcher />
        </nav>
        <div className="mobile-menu">
          <button aria-expanded={open} aria-controls="mobile-actions" aria-haspopup="menu" onClick={() => setOpen(v => !v)} onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}>Menu</button>
        </div>
      </div>
      {open && (
        <div id="mobile-actions" className="mobile-dropdown" ref={dropdownRef} role="menu">
          <Link to="/stats" onClick={() => setOpen(false)}>Stats</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          <a href="https://github.com/EasyModeLife/TheMathGames" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>GitHub</a>
          <div style={{ padding: '8px 0' }}><ThemeSwitcher /></div>
        </div>
      )}
    </header>
  );
};

export default Header;
