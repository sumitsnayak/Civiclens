import React, { useState } from 'react';
import { useAuth } from '../../lib/authStore';
import { BrandLogo } from './BrandLogo';
import { 
  Plus, 
  Map, 
  BarChart2, 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Info,
  Check,
  HelpCircle
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7E3EC] text-slate-900 shadow-[0_1px_4px_rgba(44,25,48,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="cursor-pointer group py-1"
          >
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'landing' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleNavClick('explorer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'explorer' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              <Map size={14} className={currentTab === 'explorer' ? 'text-[#552B58]' : 'text-slate-400'} />
              <span>Issues Map</span>
            </button>
            <button
              onClick={() => handleNavClick('citizen-dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'citizen-dashboard' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              <span>My Reports</span>
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'analytics' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              <BarChart2 size={14} className={currentTab === 'analytics' ? 'text-[#552B58]' : 'text-slate-400'} />
              <span>Analytics</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-[#FDF0E6] text-[#B55D1C] border border-[#F6D5BD]' 
                    : 'text-[#B55D1C] hover:bg-[#FDF0E6]/60'
                }`}
              >
                <Shield size={13} />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('queries')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'queries' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              <HelpCircle size={13} className={currentTab === 'queries' ? 'text-[#552B58]' : 'text-slate-400'} />
              <span>Queries</span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'about' 
                  ? 'bg-[#EDE5F0] text-[#552B58]' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F3F8]'
              }`}
            >
              <Info size={13} className="text-slate-400" />
              <span>About</span>
            </button>
          </nav>

          {/* Right Action & User Controls */}
          <div className="flex items-center gap-2.5">
            {/* Primary Action Button (Dribbble Signature Plum) */}
            <button
              onClick={() => handleNavClick('report')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#442646] hover:bg-[#361D38] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Evaluator Role Selector & Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F5F4F8] hover:bg-[#EDE8F2] border border-[#E7E2ED] text-xs transition-colors"
                title="Switch demo role"
              >
                <div className="w-6 h-6 rounded-full bg-[#EDE5F0] border border-[#DFCEE2] text-[#552B58] flex items-center justify-center font-bold text-[11px] shrink-0">
                  {user?.display_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="font-bold text-slate-900 text-[11px] truncate max-w-[100px]">
                    {user?.display_name || 'Guest'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {role} Role
                  </span>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E7E2ED] shadow-[0_14px_30px_-4px_rgba(44,25,48,0.15)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#F0EDF5]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Profile
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-0.5 truncate">
                      {user?.display_name || 'Guest Citizen'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {user?.email || 'citizen@civiclens.local'}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Evaluator Role Switcher
                    </div>
                    
                    <button
                      onClick={() => signInAsDemoUser('citizen')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        role === 'citizen' 
                          ? 'bg-[#EDE5F0] text-[#552B58] font-bold' 
                          : 'text-slate-700 hover:bg-[#F7F5FA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User size={13} />
                        <div>
                          <div className="leading-tight">Marcus Vance</div>
                          <div className="text-[10px] text-slate-500 font-normal">Citizen Submitter</div>
                        </div>
                      </div>
                      {role === 'citizen' && <Check size={13} className="text-[#552B58]" />}
                    </button>

                    <button
                      onClick={() => {
                        signInAsDemoUser('admin');
                        onNavigate('admin');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                        role === 'admin' 
                          ? 'bg-[#FDF0E6] text-[#B55D1C] font-bold' 
                          : 'text-slate-700 hover:bg-[#F7F5FA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={13} />
                        <div>
                          <div className="leading-tight">Director Sharma</div>
                          <div className="text-[10px] text-slate-500 font-normal">Municipal Administrator</div>
                        </div>
                      </div>
                      {role === 'admin' && <Check size={13} className="text-[#B55D1C]" />}
                    </button>
                  </div>

                  <div className="border-t border-[#F0EDF5] mt-1 pt-1 p-1">
                    <button
                      onClick={() => onNavigate('auth')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-[#F7F5FA]"
                    >
                      <User size={13} />
                      <span>Account Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-[#F5F3F8]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E3EC] bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
              currentTab === 'landing' ? 'bg-[#EDE5F0] text-[#552B58]' : 'text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('explorer')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              currentTab === 'explorer' ? 'bg-[#EDE5F0] text-[#552B58]' : 'text-slate-700'
            }`}
          >
            <Map size={14} />
            <span>Issues Map</span>
          </button>
          <button
            onClick={() => handleNavClick('citizen-dashboard')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
              currentTab === 'citizen-dashboard' ? 'bg-[#EDE5F0] text-[#552B58]' : 'text-slate-700'
            }`}
          >
            My Reports
          </button>
          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              currentTab === 'analytics' ? 'bg-[#EDE5F0] text-[#552B58]' : 'text-slate-700'
            }`}
          >
            <BarChart2 size={14} />
            <span>Civic Analytics</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#B55D1C] bg-[#FDF0E6]"
            >
              Admin Dispatch Console
            </button>
          )}
          <button
            onClick={() => handleNavClick('queries')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              currentTab === 'queries' ? 'bg-[#EDE5F0] text-[#552B58]' : 'text-slate-700'
            }`}
          >
            <HelpCircle size={14} />
            <span>Queries & Inquiries</span>
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700"
          >
            About & Disclaimers
          </button>
        </div>
      )}
    </header>
  );
};
