import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays, ChevronDown, Compass, LayoutDashboard, LogOut, Menu,
  Settings2, ShieldCheck, TicketCheck, Users, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/events', label: 'Explore events', icon: Compass },
  { to: '/registrations', label: 'My registrations', icon: TicketCheck },
  { to: '/profile', label: 'My profile', icon: Settings2 }
];
const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Manage events', icon: CalendarDays },
  { to: '/admin/registrations', label: 'Registrations', icon: TicketCheck },
  { to: '/admin/students', label: 'Students', icon: Users }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;
  const registrationsPath = user?.role === 'admin' ? '/admin/registrations' : '/registrations';
  const initials = user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  function signOut() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <NavLink to="/" className="brand-lockup" onClick={() => setOpen(false)}>
          <span className="brand-mark">C</span><span>Campus<span className="brand-accent">Connect</span></span>
        </NavLink>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'} onClick={() => setOpen(false)}>
              <Icon size={18} /><span>{label}</span>{label === 'My registrations' && <span className="nav-indicator" />}
            </NavLink>
          ))}
        </nav>
        {user?.role === 'admin' && (
          <div className="sidebar-tip">
            <div className="sidebar-tip-icon"><ShieldCheck size={18} /></div>
            <strong>Administrator</strong>
            <p>You have full access to manage your campus community.</p>
          </div>
        )}
        <div className="sidebar-bottom">
          <div className="campus-card"><span className="online-dot" /><span>Campus community</span><span className="campus-count">Live</span></div>
          <button className="sidebar-user" onClick={() => navigate('/profile')}>
            <span className="avatar">{initials || 'CC'}</span>
            <span className="sidebar-user-copy"><strong>{user?.name}</strong><small>{user?.role === 'admin' ? 'Administrator' : user?.department || 'Student'}</small></span>
            <ChevronDown size={16} />
          </button>
          <button className="sidebar-logout" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={21} /> : <Menu size={21} />}</button>
          <div className="breadcrumb"><span>CampusConnect</span><span className="breadcrumb-slash">/</span><strong>{user?.role === 'admin' ? 'Administration' : 'Student portal'}</strong></div>
          <div className="topbar-actions"><button className="icon-button notification-button" onClick={() => navigate(registrationsPath)} aria-label="View registrations"><TicketCheck size={18} /></button>
            <button className="topbar-profile" onClick={() => navigate('/profile')}><span className="avatar avatar-small">{initials || 'CC'}</span><span>{user?.name?.split(' ')[0]}</span></button>
            <button className="icon-button logout-button" onClick={signOut} aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
