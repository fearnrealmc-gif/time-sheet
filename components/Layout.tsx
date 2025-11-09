

import React, { useState, ReactNode } from 'react';
import { Role } from '../types';
import { useApp } from '../App';

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
    attendance: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
    workers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    sites: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
    reviews: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const Sidebar: React.FC<{ isOpen: boolean, setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const { currentUser, t, view, setView, logout, company } = useApp();
  
  const navItems = [
    { label: t('dashboard'), icon: ICONS.dashboard, roles: [Role.HR, Role.Accountant, Role.Foreman, Role.Engineer], view: 'dashboard' as const },
    { label: t('attendance'), icon: ICONS.attendance, roles: [Role.HR, Role.Accountant, Role.Foreman, Role.Engineer], view: 'attendance' as const },
    { label: t('workers'), icon: ICONS.workers, roles: [Role.HR, Role.Accountant], view: 'workers' as const },
    { label: t('users'), icon: ICONS.users, roles: [Role.HR, Role.Accountant], view: 'users' as const },
    { label: t('sites'), icon: ICONS.sites, roles: [Role.HR, Role.Accountant], view: 'sites' as const },
    { label: t('reviews'), icon: ICONS.reviews, roles: [Role.HR, Role.Accountant, Role.Engineer], view: 'reviews' as const },
    { label: t('settings'), icon: ICONS.settings, roles: [Role.HR, Role.Accountant], view: 'settings' as const },
  ];

  const handleNavClick = (viewName: 'dashboard' | 'workers' | 'sites' | 'reviews' | 'settings' | 'attendance' | 'users') => {
      setView(viewName);
      setIsOpen(false);
  }

  return (
    <>
        <div className={`fixed inset-0 z-20 bg-black/30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
        <aside className={`fixed top-0 bottom-0 z-30 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 w-64 p-4 transform transition-transform lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}>
          <div className="flex items-center mb-8">
            <img src={company?.logo_url || "https://picsum.photos/40"} alt="Company Logo" className="rounded-full h-10 w-10 me-3"/>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Attendance</h1>
          </div>
          <nav className="flex-grow">
            <ul>
              {navItems.filter(item => item.roles.includes(currentUser!.role)).map((item) => (
                <li key={item.label}>
                  <a href="#" onClick={(e) => {e.preventDefault(); handleNavClick(item.view)}} 
                     className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors
                                ${view === item.view 
                                    ? 'bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-white font-semibold' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-800/50 hover:text-navy-700 dark:hover:text-white'
                                }`}>
                    {item.icon}
                    <span className="ms-4">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto">
             <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="flex items-center px-4 py-3 my-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-white transition-colors">
                {ICONS.logout}
                <span className="ms-4 font-medium">{t('logout')}</span>
             </a>
          </div>
        </aside>
    </>
  );
};

const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { currentUser, theme, setTheme, language, setLanguage, t } = useApp();
    
    return (
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-300">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <div className="relative hidden sm:block">
                         <input type="text" placeholder={t('search')} className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white border-transparent rounded-lg ps-10 pe-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-navy-500" />
                         <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                         </div>
                    </div>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>
                         <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                            {theme === 'dark' ? 
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"/></svg> :
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                            }
                        </button>
                        <div className="flex items-center">
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ms-64 rtl:lg:me-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};