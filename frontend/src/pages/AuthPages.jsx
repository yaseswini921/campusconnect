import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

function AuthLayout({ children, title, subtitle, mode }) {
  return (
    <div className="auth-page">
      <aside className="auth-visual"><Link to="/" className="brand-lockup brand-lockup-light"><span className="brand-mark">C</span><span>Campus<span className="brand-accent">Connect</span></span></Link><div className="auth-visual-content"><span className="hero-kicker"><Sparkles size={14} /> CAMPUS LIFE, CONNECTED</span><h1>There’s a place<br />for you <span>here.</span></h1><p>Discover what’s happening, meet people who get you, and make this campus your own.</p></div><div className="auth-visual-footer"><span>Find your people. Find your thing.</span><span>© {new Date().getFullYear()} CampusConnect</span></div></aside>
      <main className="auth-main"><Link to="/" className="back-home"><ArrowLeft size={16} /> Back to home</Link><div className="auth-form-wrap"><div className="auth-heading"><span className="eyebrow">{mode === 'register' ? 'YOUR CAMPUS IS WAITING' : 'WELCOME BACK'}</span><h2>{title}</h2><p>{subtitle}</p></div>{children}</div><span className="auth-privacy">Your information stays private and secure.</span></main>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loggedIn = await login(form);
      notify(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
      navigate(location.state?.from || (loggedIn.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return <AuthLayout mode="login" title="Welcome back." subtitle="Sign in to pick up where you left off."><form className="auth-form" onSubmit={submit}>
    <label>Email address<input type="email" autoComplete="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
    <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
    <button className="button button-primary button-full" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} /></button>
  </form><p className="auth-switch">New to CampusConnect? <Link to="/register">Create an account</Link></p></AuthLayout>;
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, register } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 8) return notify('Use a password with at least 8 characters.', 'error');
    if (form.password !== form.confirmPassword) return notify('Those passwords don’t match yet.', 'error');
    setSubmitting(true);
    try {
      const student = await register({ name: form.name, email: form.email, password: form.password });
      notify('Your student account is ready!');
      navigate('/dashboard', { replace: true, state: { welcome: student.name } });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return <AuthLayout mode="register" title="Make yourself at home." subtitle="Create your free student account to get started."><form className="auth-form" onSubmit={submit}>
    <label>Full name<input autoComplete="name" placeholder="e.g. Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength="2" maxLength="80" required /></label>
    <label>University email<input type="email" autoComplete="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
    <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="8" maxLength="72" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
    <label>Confirm password<input type="password" autoComplete="new-password" placeholder="Enter your password again" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
    <button className="button button-primary button-full" disabled={submitting}>{submitting ? 'Creating account...' : 'Create student account'} <ArrowRight size={17} /></button>
  </form><p className="auth-switch">Already part of the community? <Link to="/login">Sign in</Link></p><p className="auth-note">Student accounts only. Administrator accounts are created securely by your system administrator.</p></AuthLayout>;
}
