import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, LogOut, User, Shield, Building2, Truck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationPopover } from './NotificationModal';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadges = {
    Admin: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Shield },
    'Recycling Center': { bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Building2 },
    'Collection Staff': { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
    User: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: User }
  };

  const activeRoleConfig = roleBadges[user?.role] || roleBadges.User;
  const RoleIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-950 tracking-tight flex items-center gap-2">
              EcoCollect <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">E-Waste</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Recycling & Collection Platform</p>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Nav Link */}
            <Link
              to={
                user.role === 'Admin' ? '/admin' :
                user.role === 'Recycling Center' ? '/center' :
                user.role === 'Collection Staff' ? '/staff' : '/dashboard'
              }
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Dashboard</span>
            </Link>

            {/* Notifications Popover */}
            <NotificationPopover />

            {/* User Profile & Role Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${activeRoleConfig.bg}`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{user.role}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition flex items-center gap-1 text-xs font-semibold"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md shadow-slate-900/10 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
