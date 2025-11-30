
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Page, User } from '../../types';
import { FiMail, FiLock, FiUser, FiArrowLeft, FiLoader, FiCheckCircle } from 'react-icons/fi';

interface AuthProps {
  setPage: (page: Page) => void;
  onLogin: (user: User) => void;
}

// Shared container for Auth Pages
const AuthContainer: React.FC<{ children: React.ReactNode, title: string, subtitle: string }> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 animate-fade-in relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-slide-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {subtitle}
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
};

export const LoginPage: React.FC<AuthProps> = ({ setPage, onLogin }) => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError(t('auth.fillAll'));
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            if (email.includes('@') && password.length >= 6) {
                // Successful Login
                onLogin({ name: email.split('@')[0], email: email });
                setPage('home');
            } else {
                setError('Invalid credentials. Password must be at least 6 characters.');
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <AuthContainer title={t('auth.welcomeBack')} subtitle={t('auth.enterCredentials')}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                    <input
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>
                <div className="relative group">
                    <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                    <input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>
                
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => setPage('forgot-password')} 
                        className="text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                        {t('auth.forgotPassword')}?
                    </button>
                </div>

                {error && <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                    {loading ? <FiLoader className="animate-spin" /> : t('auth.login')}
                </button>
            </form>

            <div className="mt-8 text-center text-gray-400 text-sm">
                {t('auth.noAccount')} {' '}
                <button onClick={() => setPage('signup')} className="text-white font-semibold hover:underline">
                    {t('auth.createAccount')}
                </button>
            </div>
        </AuthContainer>
    );
};

export const SignupPage: React.FC<AuthProps> = ({ setPage, onLogin }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError(t('auth.fillAll'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.passMismatch'));
            return;
        }

        setLoading(true);
        setTimeout(() => {
             // Successful Signup
             onLogin({ name: name, email: email });
             setPage('home');
        }, 1500);
    };

    return (
        <AuthContainer title={t('auth.joinUs')} subtitle={t('auth.createDesc')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative group">
                    <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('auth.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>
                <div className="relative group">
                    <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>
                <div className="relative group">
                    <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>
                 <div className="relative group">
                    <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="password"
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                    />
                </div>

                {error && <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                    {loading ? <FiLoader className="animate-spin" /> : t('auth.signup')}
                </button>
            </form>

            <div className="mt-6 text-center text-gray-400 text-sm">
                {t('auth.haveAccount')} {' '}
                <button onClick={() => setPage('login')} className="text-white font-semibold hover:underline">
                    {t('auth.login')}
                </button>
            </div>
        </AuthContainer>
    );
};

export const ForgotPasswordPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) return;
        
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <AuthContainer title={t('auth.forgotPassword')} subtitle={isSent ? t('auth.resetSent') : t('auth.enterEmailDesc')}>
            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                        <input
                            type="email"
                            placeholder={t('auth.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-gray-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                    >
                        {loading ? <FiLoader className="animate-spin" /> : t('auth.resetLink')}
                    </button>
                </form>
            ) : (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle size={32} className="text-green-400" />
                    </div>
                    <p className="text-gray-300 mb-6">{t('auth.resetSent')}</p>
                </div>
            )}

            <div className="mt-8 text-center">
                <button 
                    onClick={() => setPage('login')} 
                    className="flex items-center justify-center mx-auto text-gray-400 hover:text-white transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> {t('auth.backToLogin')}
                </button>
            </div>
        </AuthContainer>
    );
};
