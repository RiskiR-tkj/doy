import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  User, 
  Mail,
  Edit2,
  Trash2,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { cn } from '../lib/utils';

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      alert('Role berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Hapus profil user ini? (Catatan: Ini hanya menghapus profil, bukan akun login di Auth)')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus profil');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert size={16} />;
      case 'guru': return <Briefcase size={16} />;
      default: return <GraduationCap size={16} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-600';
      case 'guru': return 'bg-blue-50 text-blue-600';
      default: return 'bg-green-50 text-green-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">Manajemen User.</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Otorisasi akses personil akademik dan administrasi sistem.</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-full font-black text-xs tracking-widest uppercase shadow-xl hover:bg-primary-600 transition-all">
          <UserPlus size={20} />
          TAMBAH PERSONIL
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari personil akademik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white border border-gray-100 rounded-full focus:ring-2 focus:ring-primary-100 outline-none transition-all font-bold text-sm"
          />
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-gray-100 px-6">
          <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic">Total: {users.length}</span>
          <Users size={16} className="text-gray-300" />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                <th className="px-8 py-6">Pengguna</th>
                <th className="px-8 py-6">Status Role</th>
                <th className="px-8 py-6">ID Sistem</th>
                <th className="px-8 py-6 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={4} className="px-8 py-6 animate-pulse">
                      <div className="h-12 bg-gray-100 rounded-2xl"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="font-black text-brand-dark group-hover:text-primary-700 transition-colors italic tracking-tight">{u.name}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">SMK Prima Unggul Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border border-transparent",
                      getRoleColor(u.role)
                    )}>
                      {getRoleIcon(u.role)}
                      {u.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">#{u.id.substring(0, 12)}</code>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <Users size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black italic uppercase tracking-widest text-xs">Personil Tidak Ditemukan</p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl relative z-10 border border-primary-100"
            >
              <button 
                onClick={() => setEditingUser(null)}
                className="absolute top-8 right-8 text-gray-400 hover:text-brand-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <span className="text-[10px] font-black tracking-[0.2em] text-primary-600 uppercase italic">Otoritas Akses</span>
                <h2 className="text-3xl font-black tracking-tighter text-brand-dark mt-2 italic shadow-primary-50">Ubah Role.</h2>
                <p className="text-sm font-bold text-gray-400 mt-2">Member: <span className="text-brand-dark">{editingUser.name}</span></p>
              </div>

              <div className="space-y-4">
                {['admin', 'guru', 'siswa'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleUpdateRole(editingUser.id, r)}
                    disabled={isUpdating}
                    className={cn(
                      "w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all group",
                      editingUser.role === r 
                        ? "bg-primary-50 border-primary-600 shadow-lg shadow-primary-50" 
                        : "border-gray-100 hover:border-primary-200 bg-gray-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        editingUser.role === r ? "bg-primary-600 text-white" : "bg-white text-gray-400"
                      )}>
                        {getRoleIcon(r)}
                      </div>
                      <div className="text-left">
                        <p className={cn(
                          "font-black italic uppercase tracking-widest text-xs",
                          editingUser.role === r ? "text-primary-700" : "text-gray-500"
                        )}>{r}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {r === 'admin' ? 'Akses penuh sistem' : r === 'guru' ? 'Kelola ujian & bank soal' : 'Akses pengerjaan ujian'}
                        </p>
                      </div>
                    </div>
                    {editingUser.role === r && <Check size={20} className="text-primary-600" />}
                  </button>
                ))}
              </div>
              
              {isUpdating && (
                <div className="mt-6 flex items-center justify-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest italic">
                  <Loader2 size={16} className="animate-spin" />
                  Memperbarui Database...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
