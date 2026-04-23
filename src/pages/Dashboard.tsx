import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Award,
  Users,
  Loader2,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase, Exam, Result } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedExams: 0,
    upcomingExams: 0,
    avgScore: 0,
    totalUsers: 0,
    totalExams: 0
  });
  const [activeExams, setActiveExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (profile?.role === 'admin' || profile?.role === 'guru') {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
        const { count: resultCount } = await supabase.from('results').select('*', { count: 'exact', head: true });
        
        setStats({
          completedExams: resultCount || 0,
          upcomingExams: 0,
          avgScore: 0, // Could calculate if needed
          totalUsers: userCount || 0,
          totalExams: examCount || 0
        });

        const { data: latestExams } = await supabase.from('exams').select('*').order('created_at', { ascending: false }).limit(3);
        setActiveExams(latestExams || []);

      } else {
        // Student Stats
        const { data: results } = await supabase.from('results').select('score, exam_id').eq('user_id', profile?.id);
        const { data: exams } = await supabase.from('exams').select('*').eq('status', 'active');
        
        const completedIds = results?.map(r => r.exam_id) || [];
        const availableExams = exams?.filter(e => !completedIds.includes(e.id)) || [];
        
        const totalScore = results?.reduce((acc, curr) => acc + curr.score, 0) || 0;
        const avg = results?.length ? (totalScore / results.length).toFixed(1) : '0';

        setStats({
          completedExams: results?.length || 0,
          upcomingExams: availableExams.length,
          avgScore: parseFloat(avg as string),
          totalUsers: 0,
          totalExams: exams?.length || 0
        });

        setActiveExams(availableExams.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = profile?.role === 'siswa' ? [
    { label: 'Ujian Selesai', value: stats.completedExams, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ujian Tersedia', value: stats.upcomingExams, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rata-rata Nilai', value: stats.avgScore, icon: Award, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Ujian', value: stats.totalExams, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Ujian', value: stats.totalExams, icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Hasil Dikirim', value: stats.completedExams, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Average System Score', value: '78.2', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <section>
        <span className="text-[10px] font-black tracking-widest text-primary-600 uppercase italic">Selamat Datang Kembali</span>
        <h2 className="text-5xl font-black tracking-tighter mb-2 italic">Halo, {profile?.name || 'Siswa Unggul'}.</h2>
        <p className="text-gray-500 max-w-md text-sm leading-relaxed">
          {profile?.role === 'siswa' 
            ? 'Terus tingkatkan capaian akademik kamu. Pastikan koneksi internet stabil sebelum memulai ujian.' 
            : 'Panel kontrol sistem akademik. Kelola ujian, bank soal, dan personil sekolah di sini.'}
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((s, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary-50 transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.bg, s.color)}>
              <s.icon size={24} />
            </div>
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic mb-1">{s.label}</p>
            <p className="text-3xl font-black italic tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex-1">
            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase italic">Update Terkini</span>
                <h3 className="text-xl font-black tracking-tight italic mt-1">{profile?.role === 'siswa' ? 'Ujian Tersedia.' : 'Ujian Terkini.'}</h3>
              </div>
              <button onClick={() => navigate('/app/ujian')} className="text-primary-600 text-[10px] font-black uppercase tracking-widest hover:underline border-b border-primary-100">Lihat Semua</button>
            </div>
            
            <div className="space-y-4">
              {activeExams.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-gray-400 font-bold italic">Belum ada ujian yang tersedia saat ini.</p>
                </div>
              ) : activeExams.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors uppercase italic">
                    {item.title.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-brand-dark">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Durasi: {item.duration} Menit • {item.status}</p>
                  </div>
                  <button 
                    onClick={() => navigate(profile?.role === 'siswa' ? `/app/ujian/${item.id}` : `/app/ujian/${item.id}/soal`)}
                    className="bg-brand-dark text-white text-[10px] font-black px-6 py-3 rounded-full tracking-widest uppercase shadow-lg group-hover:bg-primary-600 transition-colors"
                  >
                    {profile?.role === 'siswa' ? 'KERJAKAN' : 'KELOLA'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          {profile?.role === 'siswa' ? (
            <section className="bg-primary-600 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between h-[250px] shadow-2xl shadow-primary-200">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 italic">Capaian Akademik</p>
                <h4 className="text-7xl font-black italic tracking-tighter">{stats.avgScore}</h4>
                <p className="text-xs font-bold opacity-60 uppercase mt-2">Rata-rata Nilai Kamu</p>
              </div>
              <div className="relative z-10 flex gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">{stats.completedExams} Ujian Selesai</div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">Akademik Aktif</div>
              </div>
              <div className="absolute -right-10 -top-10 w-64 h-64 border-[32px] border-white/5 rounded-full"></div>
            </section>
          ) : (
            <section className="bg-brand-dark rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between h-[250px] shadow-2xl shadow-gray-200">
               <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 italic">Sistem Administrator</p>
                <h4 className="text-7xl font-black italic tracking-tighter">{stats.totalUsers}</h4>
                <p className="text-xs font-bold opacity-60 uppercase mt-2">Total User Terdaftar</p>
              </div>
              <div className="relative z-10 flex gap-2">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">Keamanan Aktif</div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">Verified</div>
              </div>
              <div className="absolute -right-10 -top-10 w-64 h-64 border-[32px] border-white/5 rounded-full"></div>
            </section>
          )}

          <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex-1">
            <h3 className="text-[10px] font-black tracking-widest uppercase mb-8 text-gray-300 italic">Visi SMK Prima Unggul</h3>
            <div className="space-y-6">
              <p className="text-lg font-black italic text-brand-dark leading-tight">
                "Mencetak lulusan yang Unggul, Berkarakter, dan Berdaya Saing Global."
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['TKJ', 'BC', 'DKV', 'AK', 'BD', 'MPLB'].map(j => (
                  <div key={j} className="py-3 bg-gray-50 rounded-xl border border-gray-100 text-center group hover:bg-primary-600 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 group-hover:text-white transition-colors">{j}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
