import { useState } from 'react';
import { MainPopup } from './components/MainPopup';
import { SettingsPage } from './components/SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'settings'>('main');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'main' | 'settings');
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      {currentPage === 'main' ? (
        <MainPopup onNavigate={handleNavigate} />
      ) : (
        <SettingsPage onNavigate={handleNavigate} />
      )}
    </div>
  );
}
