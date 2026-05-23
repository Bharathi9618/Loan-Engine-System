import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => (
  <div className="min-h-screen flex flex-col theme-animate-bg transition-colors duration-500">
    <Navbar />
    <main className="flex-1 flex flex-col justify-stretch">
      <Outlet />
    </main>
    <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-500">
      Loan Eligibility Engine &copy; {new Date().getFullYear()} — Rule-Based Decision System
    </footer>
  </div>
);
