import { useState, Suspense, lazy } from 'react';

// Lazy load components to reduce bundle size
const MainPopup = lazy(() => import('./components/MainPopup').then(module => ({ default: module.MainPopup })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })));

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'settings'>('main');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'main' | 'settings');
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      }>
        {currentPage === 'main' ? (
          <MainPopup onNavigate={handleNavigate} />
        ) : (
          <SettingsPage onNavigate={handleNavigate} />
        )}
      </Suspense>
    </div>
  );
}
