import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Monitor, 
  Camera, 
  Calculator, 
  Radio, 
  Briefcase, 
  ShoppingBag,
  GraduationCap
} from 'lucide-react';

const LandingPage = () => {
  const jurusans = [
    { title: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: Monitor },
    { title: 'DKV', desc: 'Desain Komunikasi Visual', icon: Camera },
    { title: 'AK', desc: 'Akuntansi', icon: Calculator },
    { title: 'BC', desc: 'Broadcasting', icon: Radio },
    { title: 'MPLB', desc: 'Manajemen Perkantoran', icon: Briefcase },
    { title: 'BD', desc: 'Bisnis Digital', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SPU
              </div>
              <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
            </div>
            <Link 
              to="/login" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2"
            >
              Masuk CBT <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block px-5 py-2 bg-primary-50 text-primary-600 rounded-full text-xs font-black tracking-widest uppercase mb-8 italic">
              Integrity in Education
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-brand-dark mb-10 leading-[0.9] tracking-tighter italic">
              Membangun<br />
              <span className="text-primary-600">Generasi Unggul</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
              Sistem ujian digital modern SMK Prima Unggul untuk transparansi dan kualitas akademik masa depan.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link 
                to="/login" 
                className="px-10 py-5 bg-brand-dark text-white rounded-full font-black text-xs tracking-widest hover:bg-primary-600 transition-all shadow-2xl hover:shadow-primary-100 uppercase"
              >
                MASUK KE PORTAL CBT
              </Link>
              <button className="px-10 py-5 bg-white text-gray-500 border border-gray-100 rounded-full font-black text-xs tracking-widest hover:bg-gray-50 transition-all uppercase">
                PROFIL SEKOLAH
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jurusan Grid - Editorial Style */}
      <section className="py-24 px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-md">
              <span className="text-xs font-black tracking-widest text-primary-600 uppercase italic">Program Keahlian</span>
              <h2 className="text-4xl font-black tracking-tighter text-brand-dark mt-2 italic">6 Fokus Masa Depan</h2>
            </div>
            <p className="text-gray-400 text-sm font-medium">Kurikulum yang diintegrasikan dengan standar industri <br/> untuk memastikan kesiapan kerja setiap lulusan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jurusans.map((j, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-10 rounded-[40px] border border-gray-100 bg-white hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-50 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-50 group-hover:bg-primary-600 text-gray-400 group-hover:text-white rounded-2xl flex items-center justify-center mb-10 transition-all duration-300 transform group-hover:rotate-6">
                  <j.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-brand-dark mb-3 tracking-tight italic uppercase">{j.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-sm">{j.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-xs font-black tracking-widest text-primary-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Selengkapnya <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="font-bold text-2xl mb-4">SMK Prima Unggul</div>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Gedung Pusat Keunggulan - Menyiapkan tenaga kerja profesional dan wirausahawan masa depan.
          </p>
          <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
            © 2026 SMK Prima Unggul. v1.0.5 - All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
