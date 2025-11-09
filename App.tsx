import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Role, Worker, Site, Language, Company, AttendanceEntry } from './types';
import { MOCK_USERS, MOCK_WORKERS, MOCK_SITES, MOCK_COMPANY, MOCK_ATTENDANCE_ENTRIES, TRANSLATIONS } from './constants';
import { DashboardLayout } from './components/Layout';
import { MainDashboard } from './components/Dashboard';
import { WorkersPage } from './components/workers/WorkersPage';
import { UsersPage } from './components/users/UsersPage';
import { SitesPage } from './components/sites/SitesPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ReviewsPage } from './components/reviews/ReviewsPage';
import { Button, Spinner } from './components/common/UI';

// --- Supabase Client Setup ---
const supabaseUrl = process.env.SUPABASE_URL || 'https://example-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'example-anon-key';
const isDemoMode = supabaseUrl.includes('example-project') || supabaseKey.includes('example-anon-key');

if (isDemoMode) {
    console.warn("Supabase is not configured. Running in DEMO MODE. All data is mocked and will not be saved. To connect your database, update the placeholder credentials in App.tsx.");
}

type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id'>;
        Update: Partial<Company>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id'>;
        Update: Partial<User>;
      };
       workers: {
        Row: Worker;
        Insert: Omit<Worker, 'id'>;
        Update: Partial<Worker>;
      };
       sites: {
        Row: Site;
        Insert: Omit<Site, 'id'>;
        Update: Partial<Site>;
      };
      attendance_entries: {
        Row: AttendanceEntry;
        Insert: Omit<AttendanceEntry, 'id'>;
        Update: Partial<AttendanceEntry>;
      };
    };
  };
};

const supabase = createClient<Database>(supabaseUrl, supabaseKey);


// --- Login Screen ---
const LoginScreen: React.FC<{ company: Company | null; }> = ({ company }) => {
    const { login, t } = useApp();
    const [email, setEmail] = useState('hr@demo.co');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await login(email, password);
        if (error) {
            setError(error.message);
        }
        setLoading(false);
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
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Spinner/> : t('login')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- App Context ---
type Theme = 'light' | 'dark';
type View = 'dashboard' | 'workers' | 'sites' | 'reviews' | 'settings' | 'attendance' | 'users';

interface AppContextType {
  currentUser: User | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  view: View;
  setView: (view: View) => void;
  workers: Worker[];
  saveWorker: (worker: Worker) => Promise<void>;
  deleteWorker: (workerId: string) => Promise<void>;
  users: User[];
  saveUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  sites: Site[];
  saveSite: (site: Site) => Promise<void>;
  deleteSite: (siteId: string) => Promise<void>;
  company: Company | null;
  saveCompany: (company: Partial<Company>) => Promise<void>;
  attendanceEntries: AttendanceEntry[];
  updateAttendanceEntry: (workerId: string, date: string, newEntryData: Partial<Omit<AttendanceEntry, 'id' | 'worker_id' | 'date'>>) => Promise<void>;
  login: (email: string, pass: string) => Promise<{ error: Error | null }>;
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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setCompany(MOCK_COMPANY);
      setLoading(false);
      return;
    }

    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchProfileAndData(session.user);
        } else {
            setLoading(false);
        }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            await fetchProfileAndData(session.user);
        } else {
            setCurrentUser(null);
            setWorkers([]);
            setUsers([]);
            setSites([]);
            setCompany(null);
            setAttendanceEntries([]);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
}, []);

  const fetchProfileAndData = async (authUser: any) => {
    setLoading(true);
    const { data: profile, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
    if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
    }
    setCurrentUser(profile);
    if (profile) {
        await fetchData(profile.company_id);
    }
    setLoading(false);
  };
  
  const fetchData = async (companyId: string) => {
      const [
          { data: workersData },
          { data: usersData },
          { data: sitesData },
          { data: companyData },
          { data: attendanceData }
      ] = await Promise.all([
          supabase.from('workers').select('*').eq('company_id', companyId),
          supabase.from('users').select('*').eq('company_id', companyId),
          supabase.from('sites').select('*').eq('company_id', companyId),
          supabase.from('companies').select('*').eq('id', companyId).single(),
          supabase.from('attendance_entries').select('*') // Assuming entries are implicitly linked to company via worker
      ]);

      setWorkers(workersData || []);
      setUsers(usersData || []);
      setSites(sitesData || []);
      setCompany(companyData);
      setAttendanceEntries(attendanceData || []);
  };
  
  const login = async (email: string, pass: string) => {
      if (isDemoMode) {
          const user = MOCK_USERS.find(u => u.email === email && u.password === pass);
          if (user) {
              setCurrentUser(user);
              setWorkers(MOCK_WORKERS);
              setSites(MOCK_SITES);
              setUsers(MOCK_USERS);
              setCompany(MOCK_COMPANY);
              setAttendanceEntries(MOCK_ATTENDANCE_ENTRIES);
              return { error: null };
          } else {
              return { error: new Error('Invalid email or password.') };
          }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      return { error };
  };

  const logout = async () => {
      if (!isDemoMode) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      setWorkers([]);
      setUsers([]);
      setSites([]);
      setAttendanceEntries([]);
      // Keep company data for login screen
      if(!isDemoMode) setCompany(null);
      setView('dashboard');
  };
  
  const saveWorker = async (workerToSave: Worker) => {
    if (isDemoMode) {
      if (workerToSave.id) {
        setWorkers(prev => prev.map(w => w.id === workerToSave.id ? workerToSave : w));
      } else {
        const newWorker = { ...workerToSave, id: `w${Date.now()}`, company_id: 'c1' };
        setWorkers(prev => [...prev, newWorker]);
      }
      return;
    }
    const payload = { ...workerToSave, company_id: currentUser!.company_id };
    if (workerToSave.id) {
      const { data, error } = await supabase.from('workers').update(payload).eq('id', workerToSave.id).select().single();
      if (error) console.error("Error updating worker", error);
      else setWorkers(prev => prev.map(w => w.id === data.id ? data : w));
    } else {
      const { data, error } = await supabase.from('workers').insert(payload).select().single();
      if (error) console.error("Error creating worker", error);
      else setWorkers(prev => [...prev, data]);
    }
  };

  const deleteWorker = async (workerId: string) => {
    if (currentUser?.role !== Role.HR) return;
    if (window.confirm('Are you sure you want to delete this worker?')) {
        if (isDemoMode) {
            setWorkers(prev => prev.filter(w => w.id !== workerId));
            return;
        }
        const { error } = await supabase.from('workers').delete().eq('id', workerId);
        if (error) console.error("Error deleting worker", error);
        else setWorkers(prev => prev.filter(w => w.id !== workerId));
    }
  };

  const saveUser = async (userToSave: User) => {
    if (isDemoMode) {
        if (userToSave.id) {
            setUsers(prev => prev.map(u => u.id === userToSave.id ? userToSave : u));
        } else {
            const newUser = { ...userToSave, id: `u${Date.now()}`, company_id: 'c1' };
            setUsers(prev => [...prev, newUser]);
        }
        return;
    }
    const payload = { ...userToSave, company_id: currentUser!.company_id };
    delete payload.password; 
    if (userToSave.id) {
        const { data, error } = await supabase.from('users').update(payload).eq('id', userToSave.id).select().single();
        if (error) console.error("Error updating user", error);
        else setUsers(prev => prev.map(u => u.id === data.id ? data : u));
    } else {
        const { data, error } = await supabase.from('users').insert(payload).select().single();
        if (error) console.error("Error creating user profile", error);
        else setUsers(prev => [...prev, data]);
    }
  };

  const deleteUser = async (userId: string) => {
      if(currentUser?.id === userId) return;
      if(window.confirm('Are you sure you want to delete this user?')) {
          if (isDemoMode) {
              setUsers(prev => prev.filter(u => u.id !== userId));
              return;
          }
          const { error } = await supabase.from('users').delete().eq('id', userId);
          if (error) console.error("Error deleting user", error);
          else setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };
  
  const saveSite = async (siteToSave: Site) => {
    if (isDemoMode) {
        if (siteToSave.id) {
            setSites(prev => prev.map(s => s.id === siteToSave.id ? siteToSave : s));
        } else {
            const newSite = { ...siteToSave, id: `s${Date.now()}`, company_id: 'c1' };
            setSites(prev => [...prev, newSite]);
        }
        return;
    }
    const payload = { ...siteToSave, company_id: currentUser!.company_id };
    if (siteToSave.id) {
        const { data, error } = await supabase.from('sites').update(payload).eq('id', siteToSave.id).select().single();
        if (error) console.error("Error updating site", error);
        else setSites(prev => prev.map(s => s.id === data.id ? data : s));
    } else {
        const { data, error } = await supabase.from('sites').insert(payload).select().single();
        if (error) console.error("Error creating site", error);
        else setSites(prev => [...prev, data]);
    }
  };

  const deleteSite = async (siteId: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
        if (isDemoMode) {
            setSites(prev => prev.filter(s => s.id !== siteId));
            return;
        }
        const { error } = await supabase.from('sites').delete().eq('id', siteId);
        if (error) console.error("Error deleting site", error);
        else setSites(prev => prev.filter(s => s.id !== siteId));
    }
  };
  
  const saveCompany = async (companyToSave: Partial<Company>) => {
    if (isDemoMode) {
        setCompany(prev => (prev ? { ...prev, ...companyToSave } : null));
        return;
    }
    if (!company) return;
    const { data, error } = await supabase.from('companies').update(companyToSave).eq('id', company.id).select().single();
    if(error) console.error("Error updating company", error);
    else setCompany(data);
  };
  
  const updateAttendanceEntry = async (workerId: string, date: string, newEntryData: Partial<Omit<AttendanceEntry, 'id'|'worker_id'|'date'>>) => {
      if (isDemoMode) {
          const payload = { worker_id: workerId, date: date, ...newEntryData };
          if (payload.status && payload.status !== 'P') {
              payload.site_id = undefined;
              payload.overtime_hours = undefined;
          }
          setAttendanceEntries(prev => {
              const existingIndex = prev.findIndex(e => e.worker_id === workerId && e.date === date);
              const newEntry = {
                  ...prev.find(e => e.worker_id === workerId && e.date === date),
                  id: `e${Date.now()}`,
                  ...payload
              } as AttendanceEntry;
              if (existingIndex > -1) {
                  const updated = [...prev];
                  updated[existingIndex] = newEntry;
                  return updated;
              }
              return [...prev, newEntry];
          });
          return;
      }

      const payload = { worker_id: workerId, date: date, ...newEntryData };
      if (payload.status && payload.status !== 'P') {
          payload.site_id = undefined;
          payload.overtime_hours = undefined;
      }
      const { data, error } = await supabase.from('attendance_entries').upsert(payload, { onConflict: 'worker_id, date' }).select().single();
      if (error) { console.error("Error updating attendance", error); return; }
      setAttendanceEntries(prev => {
        const existingIndex = prev.findIndex(e => e.worker_id === workerId && e.date === date);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = data;
            return updated;
        }
        return [...prev, data];
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
  
  useEffect(() => {
      if(currentUser?.language) {
          setLanguageState(currentUser.language);
      }
  }, [currentUser]);

  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language]?.[key] || key;

  const value = {
    currentUser,
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
    login,
    logout,
  };

  return <AppContext.Provider value={value}>
    {loading ? <div className="min-h-screen flex items-center justify-center"><Spinner /></div> : children}
  </AppContext.Provider>;
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
    const { currentUser, view, company } = useApp();

    if (!currentUser) {
        return <LoginScreen company={company} />;
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
        case 'attendance':
            return <MainDashboard />; // Or a dedicated page if exists
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
