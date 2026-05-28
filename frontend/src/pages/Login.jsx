import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Lock, ArrowRight, ParkingSquare, Bus, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

const resetSchema = z.object({
  securityAnswer: z.string().min(1, 'Security answer is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  const onLogin = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful', { autoClose: 1000 });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPassword(data.username);
      setResetUser({ username: data.username, securityQuestion: res.data.securityQuestion });
      setShowForgot(false);
      setShowReset(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (data) => {
    setLoading(true);
    try {
      await resetPassword({
        username: resetUser.username,
        securityAnswer: data.securityAnswer,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successfully! Please sign in.', { autoClose: 2000 });
      setShowReset(false);
      setResetUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setShowForgot(false);
    setShowReset(false);
    setResetUser(null);
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
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {showReset ? (
            <div className="animate-fade-in">
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-8 font-medium">
                <ArrowRight size={16} className="rotate-180" /> Back to Login
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Answer Security Question</h2>
              <p className="text-sm text-gray-500 mb-2">User: <strong className="text-blue-600">{resetUser?.username}</strong></p>
              {resetUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                  <strong>Security Question:</strong> {resetUser.securityQuestion}
                </div>
              )}
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-5">
                <Field form={resetForm} name="securityAnswer" label="Your Answer" icon={Lock} placeholder="Enter your security answer" />
                <div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...resetForm.register('newPassword')}
                      placeholder="New password (6+ characters)"
                      className={`w-full pl-11 pr-11 py-3 text-sm rounded-xl border bg-white/80 focus:outline-none focus:ring-2 transition-all ${
                        resetForm.formState.errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                      }`}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">{resetForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          ) : showForgot ? (
            <div className="animate-fade-in">
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-8 font-medium">
                <ArrowRight size={16} className="rotate-180" /> Back to Login
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-8">Enter your username to find your security question</p>
              <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-5">
                <Field form={forgotForm} name="username" label="Username" icon={User} placeholder="Enter your username" />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
                >
                  {loading ? 'Searching...' : 'Find Security Question'}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
                  <ParkingSquare size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to manage your parking system</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                <Field form={loginForm} name="username" label="Username" icon={User} placeholder="Enter your username" />
                <div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="Password"
                      className={`w-full pl-11 pr-11 py-3 text-sm rounded-xl border bg-white/80 focus:outline-none focus:ring-2 transition-all ${
                        loginForm.formState.errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                      }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Create account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/20">
            <ParkingSquare size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">TransitPro BPMS</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-10">
            Intelligent bus parking management system for modern terminals. Track spaces, manage payments, and generate real-time reports.
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
    </div>
  );
}