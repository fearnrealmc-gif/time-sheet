import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
// Fix: Imported Language type from types.ts
import { User, Role, Worker, Site, Language, Company, AttendanceEntry } from './types';
import { MOCK_USERS, MOCK_WORKERS, MOCK_SITES, TRANSLATIONS, MOCK_COMPANY, MOCK_ATTENDANCE_ENTRIES } from './constants';
import { DashboardLayout } from './components/Layout';
import { MainDashboard } from './components/Dashboard';
import { WorkersPage } from './components/workers/WorkersPage';
import { UsersPage } from './components/users/UsersPage';
import { SitesPage } from './components/sites/SitesPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ReviewsPage } from './components/reviews/ReviewsPage';
import { Button } from './components/common/UI';

// --- Login Screen ---
const LoginScreen: React.FC<{ onLogin: (user: User) => void; users: User[]; company: Company | null; }> = ({ onLogin, users, company }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // A trick to get the t function without the full context
    const t = (key: keyof typeof TRANSLATIONS.en) => {
        const lang = (localStorage.getItem('language') as Language) || 'en';
        return TRANSLATIONS[lang][key] || key;
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            onLogin(user);
        } else {
            setError(t('login_error'));
        }
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500";
    const labelClasses = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-navy-950 p-4">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <img src={company?.logo_url || "https://picsum.photos/60"} alt="Logo" className="rounded-full h-16 w-16" />
                </div>
                <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-2">{t('welcome_back')}</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{t('login_prompt')}</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className={labelClasses}>{t('email')}</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClasses}>{t('password')}</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} required />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                    <div className="pt-4">
                        <Button type="submit" className="w-full">{t('login')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- App Context ---
// Fix: Removed local Language type definition, now imported from types.ts
type Theme = 'light' | 'dark';
type View = 'dashboard' | 'workers' | 'sites' | 'reviews' | 'settings' | 'attendance' | 'users';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  view: View;
  setView: (view: View) => void;
  workers: Worker[];
  saveWorker: (worker: Worker) => void;
  deleteWorker: (workerId: string) => void;
  users: User[];
  saveUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  sites: Site[];
  saveSite: (site: Site) => void;
  deleteSite: (siteId: string) => void;
  company: Company | null;
  saveCompany: (company: Partial<Company>) => void;
  attendanceEntries: AttendanceEntry[];
  updateAttendanceEntry: (workerId: string, date: string, newEntryData: Partial<Omit<AttendanceEntry, 'id' | 'worker_id' | 'date'>>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
  const [view, setView] = useState<View>('dashboard');
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [sites, setSites] = useState<Site[]>(MOCK_SITES);
  const [company, setCompany] = useState<Company | null>(MOCK_COMPANY);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>(MOCK_ATTENDANCE_ENTRIES);

  const logout = () => {
      setCurrentUser(null);
      setView('dashboard'); // Reset to default view
  };

  const saveWorker = (workerToSave: Worker) => {
    setWorkers(prev => {
        const existing = prev.find(w => w.id === workerToSave.id);
        if (existing) {
            return prev.map(w => w.id === workerToSave.id ? workerToSave : w);
        } else {
            // In a real app, ID would come from the DB
            return [...prev, { ...workerToSave, id: `w${Date.now()}` }];
        }
    });
  };

  const deleteWorker = (workerId: string) => {
    if (currentUser?.role !== Role.HR) {
        alert("You do not have permission to delete workers. Only HR can perform this action.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this worker?')) {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        console.log(`HR user ${currentUser.id} deleted worker ${workerId}.`);
    }
  };

  const saveUser = (userToSave: User) => {
    setUsers(prev => {
        const existing = prev.find(u => u.id === userToSave.id);
        if (existing) {
            return prev.map(u => {
                if (u.id === userToSave.id) {
                    const finalUser = { ...u, ...userToSave };
                    // If password from form is empty/undefined, keep the old one
                    if (userToSave.password === '' || userToSave.password === undefined) {
                      finalUser.password = u.password;
                    }
                    return finalUser;
                }
                return u;
            });
        } else { // New user
            const newUser = {
                ...userToSave,
                id: `u${Date.now()}`,
                company_id: 'c1',
            };
            return [...prev, newUser];
        }
    });
  };

  const deleteUser = (userId: string) => {
      if(currentUser?.id === userId) {
          alert("You cannot delete yourself.");
          return;
      }
      if(window.confirm('Are you sure you want to delete this user?')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };
  
  const saveSite = (siteToSave: Site) => {
    setSites(prev => {
      const existing = prev.find(s => s.id === siteToSave.id);
      if (existing) {
        return prev.map(s => s.id === siteToSave.id ? siteToSave : s);
      } else {
        return [...prev, { ...siteToSave, id: `s${Date.now()}`, company_id: 'c1' }];
      }
    });
  };

  const deleteSite = (siteId: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      setSites(prev => prev.filter(s => s.id !== siteId));
    }
  };
  
  const saveCompany = (companyToSave: Partial<Company>) => {
    setCompany(prev => {
        if (!prev) return companyToSave as Company;
        const newCompany = { ...prev, ...companyToSave };
        // In a real app, this would also save to the DB.
        console.log("Company info updated:", newCompany);
        return newCompany;
    });
  };
  
  const updateAttendanceEntry = (workerId: string, date: string, newEntryData: Partial<Omit<AttendanceEntry, 'id'|'worker_id'|'date'>>) => {
    setAttendanceEntries(prev => {
        const existingIndex = prev.findIndex(e => e.worker_id === workerId && e.date === date);

        if (existingIndex > -1) {
            // Update existing entry
            const updatedEntries = [...prev];
            const currentEntry = updatedEntries[existingIndex];
            updatedEntries[existingIndex] = {
                ...currentEntry,
                ...newEntryData,
                status: newEntryData.status !== undefined ? newEntryData.status : currentEntry.status,
            };
            // If new status is not 'Present', clear site and overtime
            if (newEntryData.status && newEntryData.status !== 'P') {
                updatedEntries[existingIndex].site_id = undefined;
                updatedEntries[existingIndex].overtime_hours = undefined;
            }
            return updatedEntries;
        } else if (newEntryData.status) { // Only create if status is not empty
            // Create new entry
            const newEntry: AttendanceEntry = {
                id: `e${Date.now()}`,
                worker_id: workerId,
                date: date,
                status: newEntryData.status || '',
                site_id: newEntryData.site_id,
                overtime_hours: newEntryData.overtime_hours,
            };
            return [...prev, newEntry];
        }
        return prev; // No change
    });
  };


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);
  
  // Fix: This useEffect block now correctly reads the optional `language` property from `currentUser`.
  useEffect(() => {
      if(currentUser?.language) {
          setLanguageState(currentUser.language);
      }
  }, [currentUser]);

  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language]?.[key] || key;

  const value = {
    currentUser,
    setCurrentUser,
    theme,
    setTheme: setThemeState,
    language,
    setLanguage: setLanguageState,
    t,
    view,
    setView,
    workers,
    saveWorker,
    deleteWorker,
    users,
    saveUser,
    deleteUser,
    sites,
    saveSite,
    deleteSite,
    company,
    saveCompany,
    attendanceEntries,
    updateAttendanceEntry,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


// --- Main App Component ---
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const AppContent: React.FC = () => {
    const { currentUser, setCurrentUser, view, users, company } = useApp();

    if (!currentUser) {
        return <LoginScreen onLogin={setCurrentUser} users={users} company={company} />;
    }

    const renderView = () => {
      switch(view) {
        case 'dashboard':
          return <MainDashboard />;
        case 'workers':
          return <WorkersPage />;
        case 'users':
          return <UsersPage />;
        case 'sites':
          return <SitesPage />;
        case 'settings':
          return <SettingsPage />;
        case 'reviews':
          return <ReviewsPage />;
        default:
          return <MainDashboard />;
      }
    }

    return (
        <DashboardLayout>
            {renderView()}
        </DashboardLayout>
    );
};

export default App;