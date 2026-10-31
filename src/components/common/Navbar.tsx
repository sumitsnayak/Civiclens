import React, { useState } from 'react';
import { useAuth } from '../../lib/authStore';
import { 
  PlusCircle, 
  Map, 
  BarChart3, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, role, isAdmin, isAuthenticated, signInAsDemoUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-md border-b border-midnight-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-500 to-teal-300 flex items-center justify-center shadow-glow-teal group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 text-midnight-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Civic<span className="text-electric-500">Lens</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-electric-500/20 text-electric-400 border border-electric-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-1">See. Report. Track.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'landing' ? 'bg-midnight-800 text-electric-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-midnight-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('explorer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'explorer' ? 'bg-midnight-800 text-electric-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-midnight-800/50'
              }`}
            >
              <Map size={15} />
              <span>Explore Issues</span>
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'analytics' ? 'bg-midnight-800 text-electric-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-midnight-800/50'
              }`}
            >
              <BarChart3 size={15} />
              <span>Civic Analytics</span>
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'about' ? 'bg-midnight-800 text-electric-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-midnight-800/50'
              }`}
            >
              How It Works
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-amber-400 ${
                  currentTab === 'admin' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30' : 'hover:bg-midnight-800/50'
                }`}
              >
                <ShieldCheck size={15} />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Primary Action: Report Issue Button */}
            <button
              onClick={() => handleNavClick('report')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-bold text-sm shadow-glow-teal hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle size={16} />
              <span>Report an Issue</span>
            </button>

            {/* User Account / Role Switcher Popover */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-midnight-900 border border-midnight-800 hover:border-slate-700 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-midnight-800 flex items-center justify-center text-xs font-bold text-electric-400 border border-midnight-700 overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <div className="hidden lg:block text-xs leading-tight">
                  <div className="font-semibold text-white truncate max-w-[100px]">
                    {user ? user.display_name : 'Guest Visitor'}
                  </div>
                  <div className="text-[10px] text-electric-400 font-mono capitalize">
                    {role} role
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-midnight-900 border border-midnight-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-midnight-800">
                    <p className="text-xs font-semibold text-white">{user?.display_name || 'Guest'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Demo Mode'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleNavClick('citizen-dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-midnight-800 rounded-lg flex items-center gap-2"
                    >
                      <User size={14} className="text-electric-400" />
                      <span>Citizen Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-amber-300 hover:bg-midnight-800 rounded-lg flex items-center gap-2"
                    >
                      <ShieldCheck size={14} className="text-amber-400" />
                      <span>Admin Management Portal</span>
                    </button>
                  </div>

                  {/* Demo Role Quick Switcher */}
                  <div className="pt-2 border-t border-midnight-800">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ⚡ Quick Role Switcher
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          signInAsDemoUser('citizen');
                          setUserDropdownOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-colors ${
                          role === 'citizen'
                            ? 'bg-electric-500/20 text-electric-400 border-electric-500/50'
                            : 'bg-midnight-800/80 text-slate-300 border-midnight-700 hover:bg-midnight-800'
                        }`}
                      >
                        <User size={12} />
                        <span>Citizen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          signInAsDemoUser('admin');
                          setUserDropdownOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border transition-colors ${
                          role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                            : 'bg-midnight-800/80 text-slate-300 border-midnight-700 hover:bg-midnight-800'
                        }`}
                      >
                        <ShieldCheck size={12} />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-midnight-800">
                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center gap-2"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleNavClick('auth');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-electric-400 hover:bg-electric-950/30 rounded-lg flex items-center gap-2"
                      >
                        <User size={13} />
                        <span>Sign In with Email</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('report')}
              className="p-2 rounded-xl bg-electric-500 text-midnight-950 font-bold text-xs"
              title="Report an Issue"
            >
              <PlusCircle size={18} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-midnight-900 border border-midnight-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-midnight-800 bg-midnight-950 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-midnight-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('explorer')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-midnight-900 flex items-center gap-2"
          >
            <Map size={16} className="text-electric-500" />
            <span>Explore Reported Issues</span>
          </button>
          <button
            onClick={() => handleNavClick('citizen-dashboard')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-midnight-900 flex items-center gap-2"
          >
            <User size={16} className="text-electric-500" />
            <span>My Citizen Dashboard</span>
          </button>
          <button
            onClick={() => handleNavClick('analytics')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-midnight-900 flex items-center gap-2"
          >
            <BarChart3 size={16} className="text-electric-500" />
            <span>Civic Analytics</span>
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-midnight-900 flex items-center gap-2"
          >
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Administrator Console</span>
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-midnight-900"
          >
            How CivicLens Works
          </button>

          <div className="pt-3 border-t border-midnight-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Demo Role Switch:</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  signInAsDemoUser('citizen');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  role === 'citizen' ? 'bg-electric-500 text-midnight-950' : 'bg-midnight-800 text-slate-300'
                }`}
              >
                Citizen Role
              </button>
              <button
                onClick={() => {
                  signInAsDemoUser('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  role === 'admin' ? 'bg-amber-400 text-midnight-950' : 'bg-midnight-800 text-slate-300'
                }`}
              >
                Admin Role
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
