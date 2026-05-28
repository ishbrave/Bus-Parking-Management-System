import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, User, Phone, ParkingSquare, Bus, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite book?",
  "What is the name of your best childhood friend?",
  "What was the make of your first car?",
  "What is your favorite food?",
  "What is your dream destination?",
];

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be 3+ characters').max(50),
  name: z
    .string()
    .min(3, 'Name must be 3+ characters')
    .regex(/^[A-Za-z\s]+$/, 'Name: alphabetic only'),
  phone: z
    .string()
    .regex(/^(079|078|072|073)\d{7}$/, 'Must be a valid Rwandan number (079/078/072/073 + 7 digits)'),
  password: z.string().min(6, 'Password must be 6+ characters'),
  securityQuestion: z.string().min(1, 'Please select a security question'),
  securityAnswer: z.string().min(3, 'Answer must be at least 3 characters'),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful', { autoClose: 1000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ form, name, label, type = 'text', icon: Icon, placeholder }) => {
    const err = form.formState.errors[name];
    return (
      <div>
        <div className="relative">
          {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
          <input
            type={type}
            {...form.register(name)}
            placeholder={placeholder || label}
            className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 text-sm rounded-xl border bg-white/80 focus:outline-none focus:ring-2 transition-all ${
              err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
            }`}
          />
        </div>
        {err && <p className="text-xs text-red-500 mt-1.5 ml-1">{err.message}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/20">
            <ParkingSquare size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join TransitPro</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-10">
            Create an account to start managing your bus parking operations with real-time insights and seamless control.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ParkingSquare, label: 'Spaces', desc: 'Real-time tracking' },
              { icon: Bus, label: 'Fleet', desc: 'Bus registration' },
              { icon: Shield, label: 'Secure', desc: 'Role-based access' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <item.icon size={22} className="text-blue-200 mx-auto mb-2" />
                <p className="text-white text-xs font-semibold">{item.label}</p>
                <p className="text-blue-300 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
              <User size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field form={form} name="username" label="Username" icon={User} placeholder="Username" />
              <Field form={form} name="name" label="Full Name" icon={User} placeholder="Full name" />
            </div>
            <Field form={form} name="phone" label="Phone" icon={Phone} placeholder="079XXXXXXX" />
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  placeholder="Password (6+ characters)"
                  className={`w-full pl-11 pr-11 py-3 text-sm rounded-xl border bg-white/80 focus:outline-none focus:ring-2 transition-all ${
                    form.formState.errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <hr className="border-blue-100" />
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <HelpCircle size={14} /> Password Recovery Setup
            </p>

            <div>
              <select
                {...form.register('securityQuestion')}
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-white/80 focus:outline-none focus:ring-2 transition-all ${
                  form.formState.errors.securityQuestion ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                }`}
              >
                <option value="">Select a security question...</option>
                {SECURITY_QUESTIONS.map((q, i) => (
                  <option key={i} value={q}>{q}</option>
                ))}
              </select>
              {form.formState.errors.securityQuestion && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{form.formState.errors.securityQuestion.message}</p>
              )}
            </div>

            <Field form={form} name="securityAnswer" label="Your Answer" icon={Lock} placeholder="Answer (you'll need this to recover your password)" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}