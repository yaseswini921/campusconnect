import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { EventDetailsPage, EventsPage, ProfilePage, RegistrationsPage, StudentDashboard } from './pages/StudentPages';
import { AdminDashboard, ManageEventsPage, ManageRegistrationsPage, StudentsPage } from './pages/AdminPages';

function ExploreLayout() {
  const { user } = useAuth();
  return <div className="explore-layout"><header className="explore-topbar"><Link to="/" className="brand-lockup"><span className="brand-mark">C</span><span>Campus<span className="brand-accent">Connect</span></span></Link><nav><Link to="/events">Explore events</Link>{user ? <Link className="button button-primary button-small" to={user.role === 'admin' ? '/admin' : '/dashboard'}>My dashboard</Link> : <><Link to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Join your campus</Link></>}</nav></header><main className="explore-content"><Outlet /></main></div>;
}

function NotFound() {
  return <div className="not-found"><span className="eyebrow">A LITTLE OFF THE MAP</span><h1>This page wandered off.</h1><p>Let’s get you back to where the good stuff is.</p><Link className="button button-primary" to="/">Back to CampusConnect</Link></div>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ExploreLayout />}>
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute admin />}>
      <Route element={<AppShell />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<ManageEventsPage />} />
        <Route path="/admin/registrations" element={<ManageRegistrationsPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><ToastProvider><BrowserRouter><AppRoutes /></BrowserRouter></ToastProvider></AuthProvider>;
}
