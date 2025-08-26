import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// App Shell
import AppShell from './AppShell';

// Eagerly load the home page component
import Home from '../pages/Home';

// Lazily load other pages
const About = lazy(() => import('../pages/About'));
const ArithmeticPage = lazy(() => import('../pages/ArithmeticPage'));
const CalculusPage = lazy(() => import('../pages/CalculusPage'));
const StatsPage = lazy(() => import('../pages/StatsPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Prefetch en reposo para minimizar flashes de Suspense
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    import('../pages/ArithmeticPage');
    import('../pages/CalculusPage');
    import('../pages/StatsPage');
    import('../pages/About');
  });
} else {
  setTimeout(() => {
    import('../pages/ArithmeticPage');
    import('../pages/CalculusPage');
    import('../pages/StatsPage');
    import('../pages/About');
  }, 1000);
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'stats',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <StatsPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'arithmetic',
        element: <Navigate to="/arithmetic/game" replace />,
      },
      {
        path: 'arithmetic/:view',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ArithmeticPage />
          </Suspense>
        ),
      },
      {
        path: 'calculus',
        element: <Navigate to="/calculus/game" replace />,
      },
      {
        path: 'calculus/:view',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CalculusPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <NotFound />
          </Suspense>
        ),
      }
    ],
  },
]);

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
