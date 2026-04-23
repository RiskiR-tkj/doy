import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Play, 
  Edit3, 
  Trash2, 
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase, Exam } from '../lib/supabase';
import { cn, formatDuration } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const ExamList = () => {
  const { profile } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newExam, setNewExam] = useState({
    title: '',
    duration: 60,
    description: ''
  });

  const navigate = useNavigate();

  const isAdminOrGuru = profile?.role === 'admin' || profile?.role === 'guru';

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('exams').insert({
        ...newExam,
        created_by: profile.id
      }).select().single();

      if (error) throw error;
      
      setExams([data, ...exams]);
      setShowCreateModal(false);
      setNewExam({ title: '', duration: 60, description: '' });
      // Redirect langsung ke input soal
      navigate(`/app/ujian/${data.id}/soal`);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat ujian');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExam = async (id: string) => {
    if (!window.confirm('Hapus ujian ini beserta seluruh soalnya?')) return;
    try {
      await supabase.from('exams').delete().eq('id', id);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">Katalog Ujian.</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Daftar evaluasi kompetensi akademik yang tersedia.</p>
        </div>
        {isAdminOrGuru && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-full font-black text-xs tracking-widest uppercase shadow-xl hover:bg-primary-600 transition-all"
          >
            <Plus size={20} />
            BUAT PENILAIAN BARU
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white border border-gray-100 rounded-full focus:ring-2 focus:ring-primary-100 outline-none transition-all font-bold text-sm"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada ujian</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Tunggu informasi selanjutnya dari guru atau administrator mengenai jadwal ujian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <motion.div
              layout
              key={exam.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:shadow-primary-50 hover:border-primary-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  exam.status === 'active' ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                )}>
                  {exam.status === 'active' ? 'Aktif' : 'Draft'}
                </div>
                {isAdminOrGuru && (
                  <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 group-hover:text-gray-900 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{exam.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">{exam.description || 'Tidak ada deskripsi ujian.'}</p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-xs font-bold py-3 border-y border-gray-50">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} />
                    <span>{formatDuration(exam.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CheckCircle2 size={14} />
                    <span>40 Soal</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isAdminOrGuru ? (
                    <>
                      <button 
                        onClick={() => navigate(`/app/ujian/${exam.id}/soal`)}
                        className="flex-1 px-4 py-2.5 bg-brand-dark text-white rounded-xl font-bold text-xs hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest italic"
                      >
                        <Edit3 size={14} /> Input Soal
                      </button>
                      <button 
                        onClick={() => deleteExam(exam.id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => navigate(`/app/ujian/${exam.id}`)}
                      className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-100"
                    >
                      <Play size={16} /> Kerjakan Sekarang
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl relative z-10 border border-primary-100"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-8 right-8 text-gray-400 hover:text-brand-dark transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <span className="text-[10px] font-black tracking-[0.2em] text-primary-600 uppercase italic">Konfigurasi Akademik</span>
                <h2 className="text-3xl font-black tracking-tighter text-brand-dark mt-2 italic">Ujian Baru.</h2>
              </div>

              <form onSubmit={handleCreateExam} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic px-1">Judul Penilaian</label>
                  <input
                    type="text"
                    required
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    placeholder="Contoh: Matematika Dasar - Kelas XII"
                    className="w-full bg-gray-50 border-2 border-gray-100 py-4 px-6 rounded-2xl outline-none focus:border-primary-600 focus:bg-white transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic px-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      required
                      value={newExam.duration}
                      onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 border-2 border-gray-100 py-4 px-6 rounded-2xl outline-none focus:border-primary-600 focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic px-1">Status</label>
                    <div className="w-full bg-green-50 border-2 border-green-100 py-4 px-6 rounded-2xl text-green-600 font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} /> AKTIF
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic px-1">Keterangan Singkat</label>
                  <textarea
                    value={newExam.description}
                    onChange={e => setNewExam({...newExam, description: e.target.value})}
                    placeholder="Instruksi pengerjaan..."
                    className="w-full bg-gray-50 border-2 border-gray-100 py-4 px-6 rounded-2xl outline-none focus:border-primary-600 focus:bg-white transition-all font-bold min-h-[100px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-brand-dark hover:bg-primary-600 text-white py-5 rounded-full font-black tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-primary-100 uppercase"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  KONFIRMASI & INPUT SOAL
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamList;
