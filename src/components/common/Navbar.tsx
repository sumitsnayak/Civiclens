import React, { useState } from 'react';
import { useAuth } from '../../lib/authStore';
import { BrandLogo } from './BrandLogo';
import { 
  Plus, 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Check
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

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'explorer', label: 'Issues Map' },
    { id: 'citizen-dashboard', label: 'My Reports' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'queries', label: 'Queries' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090A0E]/95 backdrop-blur-xl border-b border-white/[0.08] text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. Brand Logo (Automotive Precision Shield) */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="cursor-pointer group flex items-center gap-3 py-2"
          >
            <BrandLogo size="md" variant="dark" />
          </div>

          {/* 2. Desktop Navigation (Lamborghini-Inspired Pure Typographic Links) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-7 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E5A93C] shadow-[0_0_12px_#E5A93C] rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Admin Console (Exclusive Gold Accent) */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`relative py-7 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'text-[#E5A93C]'
                    : 'text-amber-500/80 hover:text-amber-400'
                }`}
              >
                <Shield size={12} className="stroke-[2.2]" />
                <span>Admin Console</span>
                {currentTab === 'admin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E5A93C] shadow-[0_0_12px_#E5A93C] rounded-full" />
                )}
              </button>
            )}
          </nav>

          {/* 3. Right Action & User Controls */}
          <div className="flex items-center gap-4">
            
            {/* Primary Action Button (Lamborghini Signature Amber Accent) */}
            <button
              onClick={() => handleNavClick('report')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#E5A93C] hover:bg-[#F2B64B] text-black font-extrabold text-[11px] tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(229,169,60,0.25)] hover:shadow-[0_0_28px_rgba(229,169,60,0.45)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} className="stroke-[3]" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Evaluator Role Selector & Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-xs transition-colors"
                title="Switch demo role"
              >
                <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-amber-400 to-[#C68D25] text-black flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                  {user?.display_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="font-bold text-white text-[11px] truncate max-w-[100px] tracking-wide">
                    {user?.display_name || 'Guest'}
                  </span>
                  <span className="text-[9px] text-[#E5A93C] font-semibold uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <ChevronDown size={11} className="text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-3 w-64 rounded-sm bg-[#101116] border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-white/[0.08]">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                      Active Profile
                    </div>
                    <div className="font-bold text-xs text-white mt-0.5 truncate">
                      {user?.display_name || 'Guest Citizen'}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {user?.email || 'citizen@civiclens.local'}
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="px-2 pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                      Switch Role
                    </div>
                    
                    <button
                      onClick={() => signInAsDemoUser('citizen')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs text-left transition-colors ${
                        role === 'citizen' 
                          ? 'bg-white/[0.08] text-white font-bold' 
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-zinc-400" />
                        <div>
                          <div className="leading-tight">Marcus Vance</div>
                          <div className="text-[10px] text-zinc-500">Citizen Reporter</div>
                        </div>
                      </div>
                      {role === 'citizen' && <Check size={13} className="text-[#E5A93C]" />}
                    </button>

                    <button
                      onClick={() => {
                        signInAsDemoUser('admin');
                        onNavigate('admin');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs text-left transition-colors ${
                        role === 'admin' 
                          ? 'bg-white/[0.08] text-white font-bold' 
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield size={13} className="text-[#E5A93C]" />
                        <div>
                          <div className="leading-tight">Director Sharma</div>
                          <div className="text-[10px] text-zinc-500">Municipal Admin</div>
                        </div>
                      </div>
                      {role === 'admin' && <Check size={13} className="text-[#E5A93C]" />}
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-white/[0.08] px-2">
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer (Matte Obsidian) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0D12] border-b border-white/[0.1] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  isActive 
                    ? 'bg-white/[0.08] text-[#E5A93C]' 
                    : 'text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.16em] ${
                currentTab === 'admin' 
                  ? 'bg-white/[0.08] text-[#E5A93C]' 
                  : 'text-amber-500 hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield size={14} />
                <span>Admin Console</span>
              </span>
            </button>
          )}

          <div className="pt-3 border-t border-white/[0.08]">
            <button
              onClick={() => handleNavClick('report')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#E5A93C] text-black font-extrabold text-xs uppercase tracking-[0.16em] shadow-lg"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
