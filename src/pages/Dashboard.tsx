import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const { profile } = useAuthStore();

  const stats = [
    { label: 'Ujian Selesai', value: '12', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ujian Mendatang', value: '3', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rata-rata Nilai', value: '88.5', icon: Award, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Jam Belajar', value: '45', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <section>
        <h2 className="text-5xl font-black tracking-tighter mb-2 italic">Halo, {profile?.name || 'Siswa Unggul'}!</h2>
        <p className="text-gray-500 max-w-md text-sm leading-relaxed">
          Semoga harimu menyenangkan. Pastikan koneksi internet kamu stabil sebelum memulai ujian daring hari ini.
        </p>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex-1">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-lg font-black tracking-tight uppercase border-b-2 border-primary-600 pb-1">Ujian Aktif</h3>
              <button className="text-primary-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Lihat Semua</button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: 'Dasar-dasar Penyiaran (Video)', teacher: 'Drs. Mulyadi', duration: '90 Menit', code: 'BC' },
                { title: 'Matematika Terapan', teacher: 'Ibu Ratna', duration: '120 Menit', code: 'TKJ' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors uppercase italic">
                    {item.code}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-brand-dark">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Guru: {item.teacher} • {item.duration}</p>
                  </div>
                  <button className="bg-primary-600 text-white text-[10px] font-bold px-5 py-2.5 rounded-lg tracking-widest uppercase">
                    KERJAKAN
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent opacity-50">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 font-bold italic">AK</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">Administrasi Pajak</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Terjadwal: Besok, 08:00 WIB</p>
                </div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          <section className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between h-[220px] shadow-xl shadow-primary-100">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Rata-rata Nilai</p>
              <h4 className="text-7xl font-black italic">88.4</h4>
            </div>
            <div className="relative z-10 flex gap-2">
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">3 Ujian Selesai</div>
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">Top 10% Kelas</div>
            </div>
            <div className="absolute -right-10 -top-10 w-48 h-48 border-[24px] border-white/5 rounded-full"></div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex-1">
            <h3 className="text-sm font-black tracking-widest uppercase mb-6 text-gray-400 italic">6 Jurusan Unggulan</h3>
            <div className="grid grid-cols-3 gap-3">
              {['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'].map((j, i) => (
                <div 
                  key={j} 
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-default text-center flex items-center justify-center",
                    i % 3 === 2 ? "bg-primary-600 border-primary-500 text-white" : "bg-gray-50 border-gray-100 text-brand-dark"
                  )}
                >
                  <p className="text-xs font-black italic">{j}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Pengumuman Terbaru</p>
              <p className="text-[11px] leading-relaxed text-gray-600 font-medium">
                Hasil Ujian Akhir Semester Ganjil akan diumumkan pada tanggal 20 Desember melalui portal akademik ini.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Internal utility since I missed it in import

export default Dashboard;
