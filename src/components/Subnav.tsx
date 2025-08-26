import { NavLink } from 'react-router-dom';
import './Subnav.css';

interface SubnavProps {
  basePath: string;
}

const Subnav = ({ basePath }: SubnavProps) => {
  const links = [
    { path: 'game', label: 'Game' },
    { path: 'practice', label: 'Practice' },
    { path: 'learning', label: 'Learning' },
    { path: 'howto', label: 'How To' },
  ];

  return (
    <nav className="subnav" aria-label="Vistas del módulo">
      <div className="subnav-links">
        {links.map(({ path, label }) => (
          <NavLink
            key={path}
            to={`${basePath}/${path}`}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Subnav;
