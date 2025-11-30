
import React from 'react';
import { Page } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { FiHome, FiUpload, FiBarChart2, FiSettings, FiChevronLeft, FiChevronRight, FiTrendingUp } from 'react-icons/fi';

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ page, setPage, isCollapsed, setIsCollapsed }) => {
  const { t } = useLocalization();

  const navItems = [
    { id: 'home', icon: FiHome, label: t('home') },
    { id: 'upload', icon: FiUpload, label: t('uploadImage') },
    { id: 'analytics', icon: FiBarChart2, label: t('insightsAnalytics') },
    { id: 'settings', icon: FiSettings, label: t('settings') },
  ];

  return (
     <aside className={`hidden md:flex flex-col bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg shadow-2xl transition-all duration-300 ease-in-out fixed h-full z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-center h-20 border-b border-white/10 dark:border-gray-700/50">
        <h1 className={`text-2xl font-bold text-green-400 overflow-hidden transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'w-0' : 'w-auto'}`}>
          {t('logo')}
        </h1>
        <span className={`text-3xl transition-all duration-300 ${isCollapsed ? 'opacity-100' : 'opacity-0 w-0'}`}>🌿</span>
      </div>

      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-24 bg-green-500 text-white p-1.5 rounded-full z-40 hover:bg-green-400 transition-transform hover:scale-110 shadow-lg border-2 border-gray-800">
        {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
      </button>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as Page)}
            title={item.label}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group sidebar-item
              ${isCollapsed ? 'justify-center' : ''}
              ${page === item.id 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/50'}`
            }
          >
            <item.icon className="w-6 h-6 sidebar-icon transition-all duration-200 flex-shrink-0" />
            <span className={`font-medium ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
      
       <div className={`border-t border-white/10 dark:border-gray-700/50 p-4 transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100'}`}>
        <div className="bg-white/10 dark:bg-gray-700/50 p-3 rounded-lg">
          <div className="flex items-center text-sm mb-2">
            <FiTrendingUp className="w-5 h-5 mr-2 text-green-400" />
            <span className="font-semibold text-gray-300">{t('farmInsights')}</span>
          </div>
          <p className="text-xs text-gray-400">Temp: <span className="font-bold text-white">28°C</span></p>
          <p className="text-xs text-gray-400">Humidity: <span className="font-bold text-white">85%</span></p>
          <p className="text-xs text-gray-400">Avg. Accuracy: <span className="font-bold text-white">95.2%</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
