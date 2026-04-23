import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/store';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const signIn = useAuthStore(state => state.signIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Editorial Branding Side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gray-50 border-r border-gray-200 p-20 text-brand-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100 rounded-full -mr-64 -mt-64 opacity-20 blur-[100px]"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-lg"
        >
          <div className="flex items-center gap-4 justify-center mb-12">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl italic shadow-2xl shadow-primary-200">
              SPU
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tighter leading-none">SMK PRIMA<br/>UNGGUL</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest italic">CBT Portal</p>
            </div>
          </div>
          
          <h2 className="text-6xl font-black italic tracking-tighter mb-8 leading-none">Integritas &<br/><span className="text-primary-600">Keunggulan</span></h2>
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            Sistem evaluasi digital transparan untuk masa depan siswa yang lebih cerah.
          </p>
        </motion.div>
      </div>

      {/* Modern High-Contrast Login Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-white lg:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-14">
            <h1 className="text-xs font-black tracking-[0.3em] text-primary-600 mb-4 uppercase">Selamat Datang Kembali</h1>
            <h2 className="text-4xl font-black tracking-tighter italic italic">Silakan Masuk.</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-l-red-600 text-red-600 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
              </motion.div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">IDENTITAS EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-transparent border-b-2 border-gray-100 py-3 text-lg font-bold text-brand-dark focus:border-primary-600 outline-none transition-all placeholder:text-gray-200"
                placeholder="email@sekolah.sch.id"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">KATA SANDI</label>
                <button type="button" className="text-[10px] font-black text-primary-600 uppercase tracking-widest">LUPA?</button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-transparent border-b-2 border-gray-100 py-3 text-lg font-bold text-brand-dark focus:border-primary-600 outline-none transition-all placeholder:text-gray-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-primary-600 text-white py-5 rounded-full font-black tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase shadow-xl hover:shadow-primary-100"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              AUTENTIKASI SEKARANG
            </button>
          </form>

          <div className="mt-16 flex items-center gap-4 text-gray-200">
            <div className="h-px bg-current flex-1"></div>
            <span className="text-[10px] font-black tracking-widest uppercase">SMK PRIMA UNGGUL</span>
            <div className="h-px bg-current flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
