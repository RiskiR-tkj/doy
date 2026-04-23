import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { supabase, Result, Exam } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ResultsPage = () => {
  const { profile } = useAuthStore();
  const [results, setResults] = useState<(Result & { exam: Exam })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [profile]);

  const fetchResults = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*, exam:exams(*)')
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">Riwayat Ujian.</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Evaluasi capaian akademik dan statistik progres belajar Anda.</p>
        </div>
        <div className="bg-primary-50 px-6 py-3 rounded-full border border-primary-100 flex items-center gap-3 shadow-sm">
          <Award className="text-primary-600" size={20} />
          <span className="text-xs font-black tracking-widest text-primary-700 uppercase">TOTAL UJIAN: {results.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada hasil</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Selesaikan ujian pertama Anda untuk melihat riwayat nilai di sini.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {results.map((res, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={res.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group"
            >
              <div className={cn(
                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 duration-300",
                res.score >= 75 ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
              )}>
                <span className="text-2xl font-black">{res.score}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest -mt-1">Poin</span>
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{res.exam?.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {format(new Date(res.completed_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Selesai dlm {Math.round((new Date(res.completed_at).getTime() - new Date(res.started_at).getTime()) / 60000)} Menit
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto px-6 py-4 md:py-0 border-t md:border-t-0 md:border-l border-gray-50">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 text-green-600 font-bold justify-center">
                    <CheckCircle2 size={16} />
                    {res.correct_answers}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Benar</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5 text-red-500 font-bold justify-center">
                    <XCircle size={16} />
                    {res.total_questions - res.correct_answers}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Salah</div>
                </div>
                <button className="ml-auto md:ml-0 p-3 bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all group-hover:bg-primary-600 group-hover:text-white">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
