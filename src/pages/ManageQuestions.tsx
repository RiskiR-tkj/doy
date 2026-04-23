import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Save, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  LayoutGrid,
  Upload,
  Download,
  Edit3
} from 'lucide-react';
import Papa from 'papaparse';
import { supabase, Question, Exam } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { cn } from '../lib/utils';

const ManageQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeForm, setActiveForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Form State
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as 'a' | 'b' | 'c' | 'd'
  });

  useEffect(() => {
    if (profile && profile.role === 'siswa') {
      navigate('/app');
      return;
    }
    fetchData();
  }, [examId, profile]);

  const fetchData = async () => {
    try {
      const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
      setExam(examData);

      const { data: qData } = await supabase.from('questions').select('*').eq('exam_id', examId).order('created_at', { ascending: true });
      setQuestions(qData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingQuestionId) {
        const { data, error } = await supabase
          .from('questions')
          .update(newQuestion)
          .eq('id', editingQuestionId)
          .select()
          .single();

        if (error) throw error;
        setQuestions(questions.map(q => q.id === editingQuestionId ? data : q));
        setEditingQuestionId(null);
        alert('Soal berhasil diperbarui!');
      } else {
        const { data, error } = await supabase.from('questions').insert({
          exam_id: examId,
          ...newQuestion
        }).select().single();

        if (error) throw error;
        setQuestions([...questions, data]);
      }
      
      setNewQuestion({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a'
      });
      setActiveForm(false);
    } catch (err) {
      alert(editingQuestionId ? 'Gagal memperbarui soal' : 'Gagal menambah soal');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditQuestion = (q: Question) => {
    setNewQuestion({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer as any
    });
    setEditingQuestionId(q.id);
    setActiveForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importedData = results.data.map((row: any) => ({
            exam_id: examId,
            question_text: row.question_text || row.pertanyaan,
            option_a: row.option_a || row.opsi_a,
            option_b: row.option_b || row.opsi_b,
            option_c: row.option_c || row.opsi_c,
            option_d: row.option_d || row.opsi_d,
            correct_answer: (row.correct_answer || row.jawaban_benar || 'a').toLowerCase()
          }));

          const { data, error } = await supabase.from('questions').insert(importedData).select();
          if (error) throw error;

          setQuestions([...questions, ...(data || [])]);
          alert(`Berhasil mengimpor ${data?.length} soal!`);
        } catch (err) {
          console.error(err);
          alert('Gagal mengimpor CSV. Pastikan format kolom sesuai: question_text, option_a, option_b, option_c, option_d, correct_answer');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (err) => {
        console.error(err);
        alert('Gagal membaca file CSV');
        setIsImporting(false);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "question_text,option_a,option_b,option_c,option_d,correct_answer\nContoh soal?,Pilihan satu,Pilihan dua,Pilihan tiga,Pilihan empat,a";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_soal.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQuestion = async (id: string) => {
    if (!window.confirm('Hapus soal ini?')) return;
    try {
      await supabase.from('questions').delete().eq('id', id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/app/ujian" className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary-600 transition-all hover:shadow-lg">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">Bank Soal.</h1>
            <p className="text-sm text-gray-500 font-medium">Ujian: <span className="text-brand-dark font-bold">{exam?.title}</span></p>
          </div>
        </div>
        <button 
          onClick={() => setActiveForm(!activeForm)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-full font-black text-xs tracking-widest uppercase shadow-xl hover:bg-primary-600 transition-all"
        >
          {activeForm ? <ChevronLeft size={18} /> : <Plus size={18} />}
          {activeForm ? 'BATALKAN' : 'TAMBAH SOAL BARU'}
        </button>
      </div>

      {/* Import & Template Row */}
      {!activeForm && (
        <div className="flex flex-wrap items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black tracking-widest text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all uppercase italic"
          >
            {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            IMPORT CSV
          </button>
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black tracking-widest text-gray-400 hover:text-brand-dark hover:border-gray-200 transition-all uppercase italic"
          >
            <Download size={16} />
            DOWNLOAD TEMPLATE
          </button>
          <div className="h-px bg-gray-100 flex-1 hidden md:block"></div>
        </div>
      )}

      <AnimatePresence>
        {activeForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] p-10 border border-primary-100 shadow-2xl shadow-primary-50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary-600">
              <HelpCircle size={120} />
            </div>
            
            <form onSubmit={handleAddQuestion} className="relative z-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-primary-600 uppercase italic">Isi Pertanyaan</label>
                <textarea
                  required
                  value={newQuestion.question_text}
                  onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 min-h-[150px] outline-none focus:border-primary-600 focus:bg-white transition-all font-medium text-lg leading-relaxed"
                  placeholder="Tuliskan soal pilihan ganda di sini..."
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <div key={opt} className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase italic">Opsi {opt.toUpperCase()}</label>
                      <button 
                        type="button"
                        onClick={() => setNewQuestion({...newQuestion, correct_answer: opt as any})}
                        className={cn(
                          "flex items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all",
                          newQuestion.correct_answer === opt ? "text-green-600" : "text-gray-300 hover:text-gray-500"
                        )}
                      >
                        {newQuestion.correct_answer === opt && <CheckCircle2 size={12} />}
                        Jawaban Benar
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={(newQuestion as any)[`option_${opt}`]}
                      onChange={e => setNewQuestion({...newQuestion, [`option_${opt}`]: e.target.value})}
                      className={cn(
                        "w-full bg-gray-50 border-2 py-4 px-6 rounded-2xl outline-none transition-all font-bold",
                        newQuestion.correct_answer === opt ? "border-green-200 bg-green-50/50" : "border-gray-100 focus:border-primary-600"
                      )}
                      placeholder={`Opsi ${opt.toUpperCase()}...`}
                    />
                  </div>
                ))}
              </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-full font-black tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-200 uppercase italic"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {editingQuestionId ? 'Update Soal' : 'Simpan Soal ke Database'}
                    </button>
                    {editingQuestionId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setActiveForm(false);
                          setNewQuestion({
                            question_text: '',
                            option_a: '',
                            option_b: '',
                            option_c: '',
                            option_d: '',
                            correct_answer: 'a'
                          });
                        }}
                        className="w-full mt-4 text-center text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-red-600 transition-colors"
                      >
                        Batalkan Perubahan
                      </button>
                    )}
                  </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-gray-400 font-black tracking-widest text-[10px] uppercase italic">
          <LayoutGrid size={14} />
          STRUKTUR BANK SOAL ({questions.length})
        </div>

        {questions.length === 0 ? (
          <div className="py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center">
            <FileText className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold italic">Belum ada soal dalam ujian ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <motion.div
                layout
                key={q.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-6 group hover:border-primary-100 transition-all"
              >
                <div className="w-10 h-10 bg-gray-50 text-gray-400 font-black italic rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-4">
                  <p className="font-bold text-brand-dark leading-relaxed">{q.question_text}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} className={cn(
                        "text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-2",
                        q.correct_answer === opt ? "bg-green-50 text-green-700 border border-green-100" : "text-gray-400 bg-gray-50"
                      )}>
                        <span className="uppercase font-black italic">{opt}.</span>
                        {(q as any)[`option_${opt}`]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => startEditQuestion(q)}
                    className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    title="Edit Soal"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => deleteQuestion(q.id)}
                    className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Hapus Soal"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;
