import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase, Question, Exam } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { cn, formatDuration } from '../lib/utils';

const ExamSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExamData();
  }, [id]);

  const loadExamData = async () => {
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (examError) throw examError;
      setExam(examData);
      setTimeLeft(examData.duration * 60);

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', id);
      
      if (qError) throw qError;
      setQuestions(qData || []);
    } catch (err) {
      console.error('Error loading exam session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Calculate score
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) correct++;
      });
      
      const score = Math.round((correct / questions.length) * 100);

      const { error } = await supabase
        .from('results')
        .insert({
          user_id: profile?.id,
          exam_id: id,
          score,
          total_questions: questions.length,
          correct_answers: correct,
          started_at: new Date(Date.now() - (exam!.duration * 60 - timeLeft) * 1000).toISOString(),
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      navigate('/app/hasil');
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Gagal mengirim jawaban. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, id, profile, exam, timeLeft, navigate, submitting]);

  useEffect(() => {
    if (timeLeft <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, handleFinish]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-900">Menyiapkan Lembar Jawaban...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
            SPU
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900 line-clamp-1">{exam?.title}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase">{profile?.name} • CBT Session</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all font-mono text-xl font-bold",
          timeLeft < 300 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-primary-50 border-primary-100 text-primary-700"
        )}>
          <Clock size={24} />
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin mengakhiri ujian sekarang?')) {
              handleFinish();
            }
          }}
          disabled={submitting}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary-100 transition-all flex items-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          Selesai Ujian
        </button>
      </header>

      {/* Main Session */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="w-80 bg-white border-r border-gray-200 hidden lg:flex flex-col p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary-600" />
            Navigasi Soal
          </h3>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2",
                  currentIndex === i ? "border-primary-600 bg-primary-50 text-primary-700" :
                  answers[questions[i].id] ? "bg-green-50 border-green-200 text-green-600" :
                  "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Statistik Progress</h4>
            <div className="flex items-center justify-between text-sm font-bold text-gray-600">
              <span>Terjawab:</span>
              <span className="text-green-600">{Object.keys(answers).length} / {questions.length}</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary-600 h-full transition-all duration-500" 
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-200">
                  {currentIndex + 1}
                </span>
                <h2 className="text-xl font-bold text-gray-800">Pertanyaan Ke-{currentIndex + 1}</h2>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-lg leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                {currentQuestion?.question_text}
              </div>

              <div className="grid gap-4">
                {['a', 'b', 'c', 'd'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setAnswers({ ...answers, [currentQuestion!.id]: option })}
                    className={cn(
                      "group p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all",
                      answers[currentQuestion?.id] === option 
                        ? "bg-primary-50 border-primary-600 ring-4 ring-primary-50 shadow-lg shadow-primary-100" 
                        : "bg-white border-gray-100 hover:border-primary-200 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors",
                      answers[currentQuestion?.id] === option 
                        ? "bg-primary-600 text-white" 
                        : "bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                    )}>
                      {option.toUpperCase()}
                    </span>
                    <span className={cn(
                      "font-semibold",
                      answers[currentQuestion?.id] === option ? "text-primary-900" : "text-gray-700"
                    )}>
                      {(currentQuestion as any)[`option_${option}`]}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-12 pb-20 border-t border-gray-200">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all disabled:opacity-40"
              >
                <ChevronLeft size={20} /> Sebelumnya
              </button>
              
              <div className="text-gray-400 font-bold text-sm tracking-widest hidden sm:block uppercase">
                {currentIndex + 1} / {questions.length}
              </div>

              {currentIndex === questions.length - 1 ? (
                <button 
                  onClick={handleFinish}
                  disabled={submitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 bg-red-600 text-white rounded-xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 transition-all"
                >
                  <CheckCircle2 size={20} /> Kumpulkan Jawaban
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all"
                >
                  Selanjutnya <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSession;
