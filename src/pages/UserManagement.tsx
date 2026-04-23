import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Briefcase
} from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { cn } from '../lib/utils';

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
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
    <div className="max-w-6xl mx-auto space-y-6">
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
        <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
          <Filter size={18} />
          Filter Role
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">Pengguna</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">ID Pengguna</th>
                <th className="px-6 py-5">Bergabung</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4 animate-pulse">
                      <div className="h-10 bg-gray-100 rounded-xl"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{u.name}</div>
                        <div className="text-xs text-gray-400 font-medium">user_id: {u.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm",
                      getRoleColor(u.role)
                    )}>
                      {getRoleIcon(u.role)}
                      {u.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{u.id}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
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
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">Tidak ada pengguna ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
