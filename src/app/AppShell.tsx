import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Subnav from '../components/Subnav';

const AppShell = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const showSubnav = currentPath.startsWith('/arithmetic') || currentPath.startsWith('/calculus');
  const basePath = currentPath.startsWith('/arithmetic') ? '/arithmetic' : '/calculus';

  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '8px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: 8,
            border: '1px solid var(--border, #ddd)',
            borderRadius: 12,
            padding: 12,
            background: 'var(--box-bg, rgba(255,255,255,0.6))',
            backdropFilter: 'saturate(1.2) blur(2px)'
          }}
        >
          <Header />
          {showSubnav && <Subnav basePath={basePath} />}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
