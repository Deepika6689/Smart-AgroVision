
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Page, Theme, Language, User, Notification } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { FiSun, FiMoon, FiUser, FiLogOut, FiLogIn, FiSettings as FiSettingsIcon, FiBell, FiCheckCircle, FiInfo, FiAlertTriangle, FiGlobe, FiCheck } from 'react-icons/fi';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  setPage: (page: Page) => void;
  notifications: Notification[];
  onNotificationsOpen: () => void;
}

const LiveClock: React.FC = () => {
    const { language } = useLocalization();
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    
    // Map internal language codes to standard locale strings for date formatting
    const localeMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'kn': 'kn-IN',
        'te': 'te-IN'
    };

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return <span className="text-sm font-medium text-gray-300 hidden md:block">{time.toLocaleString(localeMap[language] || 'en-US', options)}</span>;
};

const TimeSince: React.FC<{ date: Date }> = ({ date }) => {
    const { t } = useLocalization();
    const [label, setLabel] = useState("");

    useEffect(() => {
        const update = () => {
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) { setLabel(Math.floor(interval) + t('time.yAgo')); return; }
            interval = seconds / 2592000;
            if (interval > 1) { setLabel(Math.floor(interval) + t('time.moAgo')); return; }
            interval = seconds / 86400;
            if (interval > 1) { setLabel(Math.floor(interval) + t('time.dAgo')); return; }
            interval = seconds / 3600;
            if (interval > 1) { setLabel(Math.floor(interval) + t('time.hAgo')); return; }
            interval = seconds / 60;
            if (interval > 1) { setLabel(Math.floor(interval) + t('time.mAgo')); return; }
            if (seconds < 5) { setLabel(t('time.justNow')); return; }
            setLabel(Math.floor(seconds) + t('time.sAgo'));
        };
        update();
        const timer = setInterval(update, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [date, t]);

    return <>{label}</>;
};

const Header: React.FC<HeaderProps> = ({ theme, setTheme, user, onLoginClick, onLogout, setPage, notifications, onNotificationsOpen }) => {
  const { t, language, setLanguage } = useLocalization();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };
  
  const handleSettingsClick = () => {
    setPage('settings');
    setIsProfileOpen(false);
  };

  const handleBellClick = () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen) {
        onNotificationsOpen(); // Mark as read when opening
    }
  };

  const languages: {code: Language, label: string, flag: string}[] = [
      { code: 'en', label: 'English', flag: '🇬🇧' },
      { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
      { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
      { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];

  return (
    <header className="relative flex items-center justify-between h-20 px-6 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border-b border-white/10 dark:border-gray-700/50">
      <h1 className="text-2xl font-bold text-green-400 text-glow cursor-pointer hover:scale-105 transition-transform" onClick={() => setPage('home')}>
        🌿 {t('logo')}
      </h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        <LiveClock />
        
        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
            <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-full text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/50 focus:outline-none flex items-center transition-colors group"
                title="Change Language"
            >
                <FiGlobe size={22} className="group-hover:text-green-400 transition-colors" />
                <span className="ml-1 text-sm font-semibold uppercase hidden sm:block group-hover:text-green-400 transition-colors">{language}</span>
            </button>
            {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-md bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-2xl z-50 animate-fade-in-down border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                    ${language === lang.code ? 'text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20' : 'text-gray-700 dark:text-gray-200'}
                                `}
                            >
                                <span className="flex items-center">
                                    <span className="mr-3 text-lg leading-none">{lang.flag}</span>
                                    {lang.label}
                                </span>
                                {language === lang.code && <FiCheck size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
            <button onClick={handleBellClick} className="p-2 rounded-full text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/50 focus:outline-none relative group">
                <FiBell size={22} className="group-hover:text-yellow-400 transition-colors" />
                {hasUnread && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white/20 dark:ring-gray-800/30 animate-pulse"></span>}
            </button>
            {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl z-40 transition-all duration-300 ease-in-out transform origin-top-right animate-fade-in-down ring-1 ring-black ring-opacity-5">
                   <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                       <h4 className="font-semibold text-gray-800 dark:text-white">{t('notifications')}</h4>
                       {hasUnread && <span className="text-xs text-green-500 font-medium">{t('newUpdates')}</span>}
                   </div>
                   <div className="max-h-80 overflow-y-auto custom-scrollbar">
                       {notifications.length > 0 ? (
                           notifications.map(notif => (
                               <div key={notif.id} className="flex items-start p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-b dark:border-gray-700/50 last:border-b-0 transition-colors cursor-default">
                                   <div className="mr-3 mt-1 flex-shrink-0">
                                        {notif.type === 'success' && <FiCheckCircle className="text-green-500" />}
                                        {notif.type === 'info' && <FiInfo className="text-blue-500" />}
                                        {notif.type === 'warning' && <FiAlertTriangle className="text-yellow-500" />}
                                        {notif.type === 'error' && <FiAlertTriangle className="text-red-500" />}
                                   </div>
                                   <div className="flex-1">
                                       <p className={`text-sm ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>{notif.message}</p>
                                       <p className="text-xs text-gray-500 dark:text-gray-500 mt-1"><TimeSince date={notif.timestamp} /></p>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="p-8 text-center">
                               <FiBell className="mx-auto h-8 w-8 text-gray-400 mb-2 opacity-50"/>
                               <p className="text-sm text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
                           </div>
                       )}
                   </div>
                </div>
            )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/50 focus:outline-none group"
          title="Toggle Theme"
        >
          {theme === 'light' ? 
            <FiMoon size={22} className="group-hover:text-purple-400 transition-colors" /> : 
            <FiSun size={22} className="group-hover:text-yellow-400 transition-colors" />
          }
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white shadow-lg hover:shadow-green-500/30 transition-all hover:scale-105"
          >
            <FiUser size={22}/>
          </button>

          {isProfileOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-xl z-40 transition-all duration-300 ease-in-out transform origin-top-right animate-fade-in-down ring-1 ring-black ring-opacity-5"
            >
              {user ? (
                <>
                  <div className="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 rounded-t-lg">
                    <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                     <button onClick={handleSettingsClick} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <FiSettingsIcon className="mr-3 text-gray-400" />
                      {t('settings')}
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                      <FiLogOut className="mr-3" />
                      {t('logout')}
                    </button>
                  </div>
                </>
              ) : (
                 <div className="p-4">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">{t('signInDesc')}</p>
                    <button onClick={onLoginClick} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 rounded-lg shadow-md transition-colors">
                      <FiLogIn className="mr-2"/>
                      {t('signIn')}
                    </button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
