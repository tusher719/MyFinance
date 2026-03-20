import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { await register(form.name, form.email, form.password); navigate('/'); toast.success('Account created!'); }
    catch (e) { toast.error(e.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-glow"><TrendingUp size={22} className="text-white" /></div>
          <div><p className="font-display font-bold text-white text-xl">FinanceOS</p><p className="text-xs text-surface-400">Smart Wallet Manager</p></div>
        </div>
        <div className="card bg-surface-900/80 backdrop-blur border-surface-800 p-8 shadow-2xl">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Create account</h1>
          <p className="text-surface-400 text-sm mb-7">Start managing your finances</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label text-surface-400">Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input bg-surface-800 border-surface-700 text-white placeholder:text-surface-600" placeholder="Your name" required /></div>
            <div><label className="label text-surface-400">Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input bg-surface-800 border-surface-700 text-white placeholder:text-surface-600" placeholder="you@example.com" required /></div>
            <div><label className="label text-surface-400">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="input bg-surface-800 border-surface-700 text-white placeholder:text-surface-600 pr-10" placeholder="Min 6 characters" required />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">{loading?'Creating...':"Create Account"}</button>
          </form>
          <p className="text-center text-sm text-surface-500 mt-6">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
