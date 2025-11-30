
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/pages/HomePage';
import UploadPage from './components/pages/UploadPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import SettingsPage from './components/pages/SettingsPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './components/pages/AuthPages';
import AgriBot from './components/AgriBot';
import { Page, Theme, User, DetectionResult, HistoryEntry, Notification } from './types';
import { FiX, FiUser, FiMail, FiMessageSquare } from 'react-icons/fi';

// --- Login Modal Component (Kept for optional quick access if needed inside app) ---
interface LoginModalProps {
  onLogin: (name: string, email: string) => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Both name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onLogin(name, email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col transform transition-all duration-300 animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sign In to AgroVision</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <FiX size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="relative">
            <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="relative">
            <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By signing in, you agree to our terms of service.
          </p>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  // Defaulting to 'login' to show the new auth flow immediately
  const [page, setPage] = useState<Page>('login'); 
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [agriBotContext, setAgriBotContext] = useState<string | null>(null);
  const [isAgriBotOpen, setIsAgriBotOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // State for UploadPage is lifted here for persistence
  const [uploadData, setUploadData] = useState<{
    result: DetectionResult | null;
    history: HistoryEntry[];
    imagePreview: string | null;
    grayscalePreview: string | null;
  }>({
    result: null,
    history: [],
    imagePreview: null,
    grayscalePreview: null,
  });


  const handleLogin = (name: string, email: string) => {
    setUser({ name, email });
    setIsLoginModalOpen(false);
  };
  
  const handleAuthLogin = (user: User) => {
      setUser(user);
      // Redirect handled by component, but state update here
  };

  const handleLogout = () => {
      setUser(null);
      setPage('login'); // Redirect to login on logout
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  
  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: new Date().toISOString(),
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    // Add to the top of the list and keep only the latest 10
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  React.useEffect(() => {
    if (agriBotContext) {
      setIsAgriBotOpen(true);
    }
  }, [agriBotContext]);

  // Determine if we are on an auth page to hide header/sidebar
  const isAuthPage = ['login', 'signup', 'forgot-password'].includes(page);

  const renderPage = () => {
    switch (page) {
      case 'login':
          return <LoginPage setPage={setPage} onLogin={handleAuthLogin} />;
      case 'signup':
          return <SignupPage setPage={setPage} onLogin={handleAuthLogin} />;
      case 'forgot-password':
          return <ForgotPasswordPage setPage={setPage} />;
      case 'home':
        return <HomePage setPage={setPage} addNotification={addNotification} />;
      case 'upload':
        return <UploadPage 
                  theme={theme} 
                  user={user} 
                  uploadData={uploadData}
                  setUploadData={setUploadData}
                  setAgriBotContext={setAgriBotContext}
                  addNotification={addNotification}
                />;
      case 'analytics':
        return <AnalyticsPage theme={theme} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage setPage={setPage} addNotification={addNotification} />;
    }
  };

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-900 to-black text-gray-800 dark:text-gray-200 transition-colors duration-300`}>
      
      {/* Conditionally render Sidebar */}
      {!isAuthPage && (
        <Sidebar 
            page={page} 
            setPage={setPage}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
        />
      )}

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isAuthPage ? (isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64') : ''}`}>
        
        {/* Conditionally render Header */}
        {!isAuthPage && (
            <Header 
            theme={theme} 
            setTheme={setTheme} 
            user={user}
            onLoginClick={openLoginModal}
            onLogout={handleLogout}
            setPage={setPage}
            notifications={notifications}
            onNotificationsOpen={markNotificationsAsRead}
            />
        )}

        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-transparent ${isAuthPage ? 'p-0' : ''}`}>
          <div className={isAuthPage ? 'h-full' : 'container mx-auto px-6 py-8'}>
            {renderPage()}
          </div>
        </main>
      </div>
      
      {/* Floating Chat Button - Hide on auth pages */}
      {!isAuthPage && agriBotContext && !isAgriBotOpen && (
        <button
          onClick={() => setIsAgriBotOpen(true)}
          title="Open AgriBot Assistant"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-lg z-40 animate-pulse btn-glow"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {isAgriBotOpen && agriBotContext && !isAuthPage && (
        <AgriBot
          diseaseContext={agriBotContext}
          onClose={() => setIsAgriBotOpen(false)}
        />
      )}

      {/* Legacy Modal - Keep for inside-app prompt if needed */}
      {isLoginModalOpen && (
        <LoginModal 
            onLogin={handleLogin} 
            onClose={() => setIsLoginModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
