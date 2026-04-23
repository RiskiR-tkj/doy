import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Award,
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const AppLayout = () => {
  const { profile, signOut } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa'] },
    { name: 'Daftar Ujian', path: '/app/ujian', icon: BookOpen, roles: ['admin', 'guru', 'siswa'] },
    { name: 'Bank Soal', path: '/app/ujian', icon: ClipboardCheck, roles: ['admin', 'guru'] },
    { name: 'Hasil Ujian', path: '/app/hasil', icon: Award, roles: ['admin', 'guru', 'siswa'] },
    { name: 'Manajemen User', path: '/app/users', icon: Users, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile?.role || 'siswa'));

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-40 fixed inset-y-0 lg:relative",
          isSidebarOpen ? "w-[280px]" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic shrink-0">
              SPU
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xs font-black tracking-tighter leading-none text-brand-dark">SMK PRIMA<br/>UNGGUL</h1>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest italic leading-none whitespace-nowrap">Portal Ujian</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {filteredMenu.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary-50 text-primary-600 font-bold" 
                    : "text-gray-500 hover:text-primary-600 hover:bg-primary-50 font-medium"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isSidebarOpen ? "" : "mx-auto")} />
                {isSidebarOpen && (
                  <span className="text-sm">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          {isSidebarOpen && (
            <div className="bg-primary-600 p-6 rounded-2xl text-white shadow-xl shadow-primary-200 relative overflow-hidden mb-6">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Bantuan</p>
                <p className="text-xs font-medium leading-relaxed">Kendala saat mengerjakan ujian? Hubungi admin IT.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest group"
          >
            <LogOut size={20} className={cn("shrink-0", isSidebarOpen ? "" : "mx-auto")} />
            {isSidebarOpen && <span>LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium italic uppercase tracking-widest text-[10px]">Portal CBT,</span>
              <span className="font-bold text-sm tracking-tight">{profile?.name}</span>
              <span className="bg-primary-50 text-primary-600 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ml-2">
                {profile?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 text-gray-400 focus-within:text-primary-600 transition-all">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="bg-transparent border-none outline-none text-xs font-bold w-40"
              />
            </div>
            
            <button className="bg-gray-50 text-gray-600 px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest hover:bg-primary-600 hover:text-white transition-all border border-gray-200 uppercase">
              NOTIFIKASI
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-35 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
