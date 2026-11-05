import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles, TicketCheck, Users, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, EventCard, getEventDate, isEventUpcoming, Loading, PageHeading, StatusBadge } from '../components/Shared';

export function StudentDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/events', { params: { upcoming: true } }), api.get('/registrations/my')])
      .then(([eventResponse, registrationResponse]) => {
        setEvents(eventResponse.data.events);
        setRegistrations(registrationResponse.data.registrations);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="inline-error">{error}</div>;
  const active = registrations.filter((item) => item.status === 'registered');
  const nextEvents = events.filter((event) => isEventUpcoming(event.date)).slice(0, 3);
  const eventsThisMonth = events.filter((event) => {
    const date = getEventDate(event.date);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
  return <div className="page-stack">
    <section className="welcome-banner"><div className="welcome-decoration">✳</div><div><span className="welcome-eyebrow"><Sparkles size={14} /> YOUR CAMPUS, YOUR WAY</span><h1>Good to see you, {user?.name?.split(' ')[0]}.</h1><p>There’s something happening for you today. Make it count.</p><Link to="/events" className="button button-white">Find your next thing <ArrowRight size={16} /></Link></div><div className="welcome-illustration"><div className="welcome-orbit orbit-one" /><div className="welcome-orbit orbit-two" /><span><CalendarDays size={37} /></span></div></section>
    <div className="stats-grid">
      <StatCard label="Upcoming events" value={events.length} sub="Open to your campus" icon={CalendarDays} tone="lilac" />
      <StatCard label="My registrations" value={active.length} sub="Plans on your calendar" icon={TicketCheck} tone="peach" />
      <StatCard label="This month" value={eventsThisMonth} sub="Events to look forward to" icon={Sparkles} tone="mint" />
    </div>
    <section className="content-section"><div className="section-title-row"><div><span className="eyebrow">SAVE THE DATE</span><h2>Coming up on campus</h2></div><Link className="text-link" to="/events">Explore all <ArrowRight size={15} /></Link></div>
      {nextEvents.length ? <div className="event-grid">{nextEvents.map((event) => <EventCard key={event._id} event={event} />)}</div> : <EmptyState title="A little quiet for now" detail="New events will show up here as soon as they’re announced." action={<Link className="button button-primary button-small" to="/events">Browse events</Link>} />}
    </section>
    <section className="content-section"><div className="section-title-row"><div><span className="eyebrow">YOUR PLANS</span><h2>Recently registered</h2></div><Link className="text-link" to="/registrations">View all <ArrowRight size={15} /></Link></div>
      {active.length ? <div className="table-card"><table><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead><tbody>{active.slice(0, 4).map((item) => <tr key={item._id}><td><strong>{item.event?.title || 'Event removed'}</strong></td><td>{item.event?.date ? getEventDate(item.event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</td><td>{item.event?.venue || '—'}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <EmptyState title="Your next plan starts here" detail="Save a seat at an event and it’ll appear right here." action={<Link className="button button-primary button-small" to="/events">Find an event</Link>} />}
    </section>
  </div>;
}

function StatCard({ label, value, sub, icon: Icon, tone }) {
  return <div className="stat-card"><span className={`stat-icon stat-${tone}`}><Icon size={20} /></span><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  useEffect(() => {
    setLoading(true);
    let active = true;
    let controller;
    const timer = window.setTimeout(() => {
      controller = new AbortController();
      api.get('/events', {
        params: {
          search: search || undefined,
          category,
          upcoming: dateFilter === 'upcoming' ? 'true' : undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined
        },
        signal: controller.signal
      })
        .then(({ data }) => { if (active) { setEvents(data.events); setError(''); } })
        .catch((err) => { if (active && !controller.signal.aborted) setError(getErrorMessage(err)); })
        .finally(() => { if (active) setLoading(false); });
    }, search ? 220 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, [search, category, dateFilter, dateFrom, dateTo]);
  const categories = ['All', 'Technology', 'Cultural', 'Workshop', 'Seminar', 'Sports', 'Competition', 'Business', 'Other'];
  return <div className="page-stack"><PageHeading eyebrow="FIND YOUR NEXT THING" title="Explore events" detail="Good people, fresh ideas, and memories waiting to happen." />
    <div className="event-filter-bar"><div className="search-field"><span className="search-glyph">⌕</span><input aria-label="Search events" placeholder="Search events, places, and more..." value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</div><select aria-label="Filter by date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option value="upcoming">Upcoming events</option><option value="all">All events</option></select><label className="date-filter"><span>From</span><input type="date" aria-label="Filter from date" max={dateTo || undefined} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); if (dateTo && e.target.value > dateTo) setDateTo(e.target.value); }} /></label><label className="date-filter"><span>To</span><input type="date" aria-label="Filter to date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} /></label></div>
    <div className="category-list">{categories.map((item) => <button key={item} className={category === item ? 'category-filter active' : 'category-filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {error ? <div className="inline-error">{error}</div> : loading ? <Loading label="Finding your next event..." /> : events.length ? <><div className="result-count">{events.length} event{events.length === 1 ? '' : 's'} to explore</div><div className="event-grid">{events.map((event) => <EventCard key={event._id} event={event} />)}</div></> : <EmptyState title="No events found" detail="Try changing your search or category to see what’s happening." action={<button className="button button-secondary button-small" onClick={() => { setSearch(''); setCategory('All'); setDateFilter('all'); setDateFrom(''); setDateTo(''); }}>Clear filters</button>} />}
  </div>;
}

export function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const notify = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([api.get(`/events/${id}`), user?.role === 'student' ? api.get('/registrations/my') : Promise.resolve({ data: { registrations: [] } })])
      .then(([eventResponse, registrationResponse]) => {
        setEvent(eventResponse.data.event);
        setRegistration(registrationResponse.data.registrations.find((item) => item.event?._id === id) || null);
      })
      .catch((err) => notify(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [id, user?.role, notify]);
  async function register() {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } });
    setSubmitting(true);
    try {
      const { data } = await api.post('/registrations', { eventId: id });
      setRegistration(data.registration);
      setEvent((current) => ({ ...current, registeredCount: current.registeredCount + 1 }));
      notify(data.message);
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSubmitting(false); }
  }
  if (loading) return <Loading />;
  if (!event) return <EmptyState title="We couldn’t find that event" detail="It may have been removed or the link may be incorrect." action={<Link to="/events" className="button button-primary button-small">Back to events</Link>} />;
  const date = getEventDate(event.date);
  const seats = Math.max(0, event.capacity - event.registeredCount);
  return <div className="page-stack"><Link className="back-link" to="/events"><ArrowRight size={15} /> Back to events</Link>
    <div className="event-detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(22,20,36,.86), rgba(22,20,36,.17)), url("${event.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}")` }}><div className="detail-hero-copy"><span className="category-pill">{event.category}</span><h1>{event.title}</h1><p><CalendarDays size={17} />{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div></div>
    <div className="event-detail-layout"><article className="detail-main"><span className="eyebrow">ABOUT THIS EVENT</span><h2>Come be part of it.</h2><p className="detail-description">{event.description}</p><div className="detail-info-grid"><InfoBlock icon={Clock3} label="Time" value={`${event.startTime} – ${event.endTime}`} /><InfoBlock icon={MapPin} label="Location" value={event.venue} /><InfoBlock icon={Users} label="Hosted by" value={event.organizer} /><InfoBlock icon={TicketCheck} label="Availability" value={`${seats} seats left`} /></div></article>
      <aside className="registration-card"><span className="eyebrow">YOUR SPOT AWAITS</span><h3>Make it a date.</h3><p>Save your seat and we’ll keep the details right here.</p><div className="seat-progress"><div><span>{event.registeredCount} of {event.capacity} spots filled</span><strong>{event.capacity ? Math.round((event.registeredCount / event.capacity) * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${event.capacity ? Math.min(100, event.registeredCount / event.capacity * 100) : 0}%` }} /></div></div>
        {user?.role === 'admin' ? <p className="admin-note">Administrator accounts cannot register for events.</p> : registration?.status === 'registered' || registration?.status === 'attended' ? <div className="registered-note"><TicketCheck size={18} /><span>You’re on the list. See you there!</span></div> : registration?.status === 'cancelled' ? <p className="admin-note">This registration was cancelled. Contact an administrator if you need to rejoin.</p> : <button className="button button-primary button-full" onClick={register} disabled={submitting || seats === 0 || !isEventUpcoming(event.date)}>{submitting ? 'Saving your spot...' : seats === 0 ? 'All spots are filled' : !isEventUpcoming(event.date) ? 'This event has passed' : 'Register for this event'} <ArrowRight size={16} /></button>}
        {!user && <small className="register-hint">You’ll need a student account to register.</small>}
      </aside></div>
  </div>;
}

function InfoBlock({ icon: Icon, label, value }) {
  return <div className="detail-info"><span><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

export function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const notify = useToast();
  function load() {
    setLoading(true);
    api.get('/registrations/my')
      .then(({ data }) => { setRegistrations(data.registrations); setError(''); })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);
  async function cancel(item) {
    if (!window.confirm(`Cancel your registration for ${item.event?.title || 'this event'}?`)) return;
    setBusy(item._id);
    try {
      const { data } = await api.delete(`/registrations/${item._id}`);
      setRegistrations((items) => items.map((record) => record._id === item._id
        ? { ...record, status: data.registration.status }
        : record));
      notify(data.message);
    } catch (err) { notify(getErrorMessage(err), 'error'); }
    finally { setBusy(''); }
  }
  return <div className="page-stack"><PageHeading eyebrow="THE MOMENTS YOU’VE SAVED" title="My registrations" detail="Your plans, all in one place. We’ll see you there." />
    {loading ? <Loading /> : error ? <div className="inline-error">{error} <button className="text-link" onClick={load}>Try again</button></div> : registrations.length ? <div className="registration-list">{registrations.map((item) => <article className="registration-item" key={item._id}><div className="registration-date-chip"><strong>{item.event?.date ? getEventDate(item.event.date).toLocaleDateString(undefined, { day: '2-digit' }) : '—'}</strong><span>{item.event?.date ? getEventDate(item.event.date).toLocaleDateString(undefined, { month: 'short' }) : 'Event'}</span></div><div className="registration-item-copy"><Link to={item.event ? `/events/${item.event._id}` : '/events'}><h3>{item.event?.title || 'Event removed'}</h3></Link><p><CalendarDays size={15} />{item.event?.date ? getEventDate(item.event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Date unavailable'} <span>·</span><MapPin size={15} />{item.event?.venue || 'Venue unavailable'}</p><small>Registered {new Date(item.registrationDate).toLocaleDateString()}</small></div><div className="registration-item-actions"><StatusBadge status={item.status} />{item.status === 'registered' && <button className="button button-secondary button-small" onClick={() => cancel(item)} disabled={busy === item._id}>{busy === item._id ? 'Cancelling...' : 'Cancel spot'}</button>}</div></article>)}</div> : <EmptyState title="Nothing on your calendar yet" detail="A great campus story might be one event away." action={<Link to="/events" className="button button-primary button-small">Explore events</Link>} />}
  </div>;
}

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', year: user?.year || '' });
  const [saving, setSaving] = useState(false);
  const notify = useToast();
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { ...form, year: form.year ? Number(form.year) : null });
      setUser(data.user);
      notify(data.message);
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSaving(false); }
  }
  return <div className="page-stack"><PageHeading eyebrow="A LITTLE ABOUT YOU" title="My profile" detail="Keep your details up to date so your campus account feels like yours." />
    <div className="profile-layout"><div className="profile-intro-card"><span className="profile-large-avatar">{user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><h2>{user?.name}</h2><span className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'Student'}</span><div className="profile-divider" /><div className="profile-info-row"><span>Email</span><strong>{user?.email}</strong></div><div className="profile-info-row"><span>Member since</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'CampusConnect'}</strong></div></div>
      <form className="profile-form card-panel" onSubmit={submit}><div><span className="eyebrow">PERSONAL DETAILS</span><h2>Make it yours</h2><p>Your email address is used to sign in and can’t be changed here.</p></div><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength="2" maxLength="80" required /></label><label>Email address<input value={user?.email || ''} disabled /></label><label>Department<input placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} maxLength="80" /></label><label>Year of study<select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}><option value="">Not specified</option>{[1, 2, 3, 4, 5, 6].map((year) => <option value={year} key={year}>Year {year}</option>)}</select></label><div className="form-actions"><button className="button button-primary" disabled={saving}>{saving ? 'Saving changes...' : 'Save changes'} <ArrowRight size={16} /></button></div></form></div>
  </div>;
}
