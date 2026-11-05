import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CirclePlus, Edit3, Search, Sparkles, TicketCheck, Trash2, Users, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { EmptyState, getEventDate, isEventUpcoming, Loading, PageHeading, StatusBadge } from '../components/Shared';

const blankEvent = {
  title: '', description: '', category: 'Technology', date: '', startTime: '10:00',
  endTime: '12:00', venue: '', image: '', capacity: '100', organizer: ''
};

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/events/stats'), api.get('/events'), api.get('/registrations'), api.get('/users')])
      .then(([statsResponse, eventResponse, registrationResponse, userResponse]) => {
        setStats(statsResponse.data.stats);
        setEvents(eventResponse.data.events);
        setRegistrations(registrationResponse.data.registrations);
        setUsers(userResponse.data.users);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading />;
  if (error) return <div className="inline-error">{error}</div>;
  const upcoming = events.filter((event) => isEventUpcoming(event.date)).slice(0, 5);
  return <div className="page-stack">
    <PageHeading eyebrow="YOUR CAMPUS AT A GLANCE" title="Admin overview" detail="A little snapshot of what’s happening across your campus." action={<Link className="button button-primary button-small" to="/admin/events"><CirclePlus size={16} /> Create an event</Link>} />
    <div className="stats-grid">
      <AdminStat label="Total students" value={users.length} note="Across your campus" icon={Users} tone="lilac" />
      <AdminStat label="Total events" value={stats.totalEvents} note="Published on CampusConnect" icon={CalendarDays} tone="peach" />
      <AdminStat label="Registrations" value={stats.registrationCount} note="Active event sign-ups" icon={TicketCheck} tone="mint" />
      <AdminStat label="Coming up" value={stats.upcomingEvents} note="Events on the calendar" icon={Sparkles} tone="blue" />
    </div>
    <section className="content-section"><div className="section-title-row"><div><span className="eyebrow">KEEP AN EYE ON</span><h2>Upcoming events</h2></div><Link className="text-link" to="/admin/events">Manage all events <ArrowRight size={15} /></Link></div>
      {upcoming.length ? <div className="table-card"><table><thead><tr><th>Event</th><th>Category</th><th>Date</th><th>Sign-ups</th><th>Capacity</th></tr></thead><tbody>{upcoming.map((event) => <tr key={event._id}><td><strong>{event.title}</strong><small className="table-sub">{event.venue}</small></td><td><span className="table-category">{event.category}</span></td><td>{getEventDate(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td><td>{event.registeredCount}</td><td>{event.capacity}</td></tr>)}</tbody></table></div> : <EmptyState title="No upcoming events" detail="Create an event to get your campus calendar moving." action={<Link to="/admin/events" className="button button-primary button-small">Create an event</Link>} />}
    </section>
    <section className="content-section"><div className="section-title-row"><div><span className="eyebrow">FRESH FROM THE COMMUNITY</span><h2>Recent registrations</h2></div><Link className="text-link" to="/admin/registrations">View all registrations <ArrowRight size={15} /></Link></div>
      {registrations.length ? <div className="table-card"><table><thead><tr><th>Student</th><th>Event</th><th>Registered</th><th>Status</th></tr></thead><tbody>{registrations.slice(0, 5).map((item) => <tr key={item._id}><td><strong>{item.student?.name || 'Student'}</strong><small className="table-sub">{item.student?.email}</small></td><td>{item.event?.title || 'Event removed'}</td><td>{new Date(item.registrationDate).toLocaleDateString()}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <EmptyState title="No registrations yet" detail="Student sign-ups will appear here." />}
    </section>
  </div>;
}

function AdminStat({ label, value, note, icon: Icon, tone }) {
  return <div className="stat-card"><span className={`stat-icon stat-${tone}`}><Icon size={20} /></span><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{note}</div></div>;
}
export function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankEvent);
  const [saving, setSaving] = useState(false);
  const notify = useToast();
  function load() {
    setLoading(true);
    api.get('/events').then(({ data }) => setEvents(data.events)).catch((error) => notify(getErrorMessage(error), 'error')).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);
  const filteredEvents = useMemo(() => events.filter((event) => `${event.title} ${event.category} ${event.venue}`.toLowerCase().includes(search.toLowerCase())), [events, search]);
  function openCreate() {
    setEditing(null);
    setForm(blankEvent);
    setModal(true);
  }
  function openEdit(event) {
    setEditing(event);
    setForm({
      title: event.title, description: event.description, category: event.category,
      date: new Date(event.date).toISOString().slice(0, 10), startTime: event.startTime,
      endTime: event.endTime, venue: event.venue, image: event.image || '',
      capacity: String(event.capacity), organizer: event.organizer
    });
    setModal(true);
  }
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, capacity: Number(form.capacity) };
    try {
      const { data } = editing ? await api.put(`/events/${editing._id}`, payload) : await api.post('/events', payload);
      setEvents((items) => (editing
        ? items.map((item) => item._id === editing._id ? data.event : item)
        : [...items, data.event]).sort((a, b) => String(a.date).localeCompare(String(b.date))));
      notify(data.message);
      setModal(false);
    } catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSaving(false); }
  }
  async function remove(event) {
    if (!window.confirm(`Delete “${event.title}”? Its registrations will also be removed.`)) return;
    try {
      const { data } = await api.delete(`/events/${event._id}`);
      setEvents((items) => items.filter((item) => item._id !== event._id));
      notify(data.message);
    } catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  return <div className="page-stack"><PageHeading eyebrow="MAKE SOMETHING HAPPEN" title="Manage events" detail="Create moments your campus will remember." action={<button className="button button-primary button-small" onClick={openCreate}><CirclePlus size={16} /> Add an event</button>} />
    <div className="management-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search events..." aria-label="Search events" value={search} onChange={(e) => setSearch(e.target.value)} /></div><span>{filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}</span></div>
    {loading ? <Loading /> : filteredEvents.length ? <div className="table-card"><table><thead><tr><th>Event</th><th>Category</th><th>Date & time</th><th>Sign-ups</th><th>Actions</th></tr></thead><tbody>{filteredEvents.map((event) => <tr key={event._id}><td><strong>{event.title}</strong><small className="table-sub">{event.venue}</small></td><td><span className="table-category">{event.category}</span></td><td>{getEventDate(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}<small className="table-sub">{event.startTime} – {event.endTime}</small></td><td>{event.registeredCount} / {event.capacity}</td><td><div className="table-actions"><Link className="icon-button" to={`/events/${event._id}`} title="View event"><ArrowRight size={16} /></Link><button className="icon-button" onClick={() => openEdit(event)} title="Edit event"><Edit3 size={16} /></button><button className="icon-button icon-danger" onClick={() => remove(event)} title="Delete event"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No events yet" detail="Your campus calendar is a blank canvas. Add the first event." action={<button className="button button-primary button-small" onClick={openCreate}>Create an event</button>} />}
    {modal && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false); }}><div className="modal-card"><div className="modal-header"><div><span className="eyebrow">{editing ? 'TUNE THE DETAILS' : 'SOMETHING TO LOOK FORWARD TO'}</span><h2>{editing ? 'Edit event' : 'Create an event'}</h2></div><button className="icon-button" onClick={() => setModal(false)} aria-label="Close"><X size={20} /></button></div>
      <form className="event-form" onSubmit={save}><label>Event title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} minLength="3" maxLength="120" required /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Technology', 'Cultural', 'Workshop', 'Seminar', 'Sports', 'Competition', 'Business', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-wide">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} minLength="10" maxLength="5000" rows="4" required /></label><label>Date<input type="date" min={editing ? undefined : new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label><label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} maxLength="160" required /></label><label>Start time<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></label><label>End time<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></label><label>Capacity<input type="number" min={editing?.registeredCount || 1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required /></label><label>Organizer<input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} maxLength="120" required /></label><label className="form-wide">Image URL <span className="label-optional">(optional)</span><input type="url" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create event'} <ArrowRight size={16} /></button></div></form>
    </div></div>}
  </div>;
}

export function ManageRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const notify = useToast();
  useEffect(() => {
    api.get('/events').then(({ data }) => setEvents(data.events)).catch((error) => notify(getErrorMessage(error), 'error'));
  }, []);
  useEffect(() => {
    setLoading(true);
    api.get('/registrations', { params: { eventId: eventFilter === 'all' ? undefined : eventFilter, status: statusFilter } })
      .then(({ data }) => setRegistrations(data.registrations))
      .catch((error) => notify(getErrorMessage(error), 'error'))
      .finally(() => setLoading(false));
  }, [eventFilter, statusFilter]);
  async function update(item, status) {
    try {
      const { data } = await api.patch(`/registrations/${item._id}/status`, { status });
      setRegistrations((items) => items.map((record) => record._id === item._id ? { ...record, status: data.registration.status } : record));
      notify(data.message);
    } catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  return <div className="page-stack"><PageHeading eyebrow="THE PEOPLE BEHIND THE NUMBERS" title="Registrations" detail="Keep track of who’s coming and help everyone feel welcome." />
    <div className="management-toolbar"><div className="filter-control"><label htmlFor="event-filter">Event</label><select id="event-filter" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}><option value="all">All events</option>{events.map((event) => <option value={event._id} key={event._id}>{event.title}</option>)}</select></div><div className="filter-control"><label htmlFor="status-filter">Status</label><select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="registered">Registered</option><option value="attended">Attended</option><option value="cancelled">Cancelled</option></select></div><span className="toolbar-result-count">{registrations.length} registration{registrations.length === 1 ? '' : 's'}</span></div>
    {loading ? <Loading /> : registrations.length ? <div className="table-card"><table><thead><tr><th>Student</th><th>Event</th><th>Signed up</th><th>Status</th><th>Update status</th></tr></thead><tbody>{registrations.map((item) => <tr key={item._id}><td><strong>{item.student?.name || 'Student'}</strong><small className="table-sub">{item.student?.email} {item.student?.department ? `· ${item.student.department}` : ''}</small></td><td><strong>{item.event?.title || 'Event removed'}</strong><small className="table-sub">{item.event?.date ? getEventDate(item.event.date).toLocaleDateString() : ''}</small></td><td>{new Date(item.registrationDate).toLocaleDateString()}</td><td><StatusBadge status={item.status} /></td><td><select className="table-select" aria-label={`Update status for ${item.student?.name || 'student'}`} value={item.status} onChange={(e) => update(item, e.target.value)}><option value="registered">Registered</option><option value="attended">Attended</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div> : <EmptyState title="No registrations to show" detail="Try another event or status filter. Student registrations will appear here." />}
  </div>;
}

export function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const notify = useToast();
  useEffect(() => {
    api.get('/users').then(({ data }) => setStudents(data.users)).catch((error) => notify(getErrorMessage(error), 'error')).finally(() => setLoading(false));
  }, []);
  const filtered = students.filter((student) => `${student.name} ${student.email} ${student.department}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-stack"><PageHeading eyebrow="YOUR CAMPUS COMMUNITY" title="Students" detail="Meet the people who make every event better." />
    <div className="management-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search by name, email, or department..." aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} /></div><span>{filtered.length} student{filtered.length === 1 ? '' : 's'}</span></div>
    {loading ? <Loading /> : filtered.length ? <div className="table-card"><table><thead><tr><th>Student</th><th>Email</th><th>Department</th><th>Year</th><th>Member since</th><th /></tr></thead><tbody>{filtered.map((student) => <tr key={student._id}><td><span className="student-table-name"><span className="avatar avatar-small">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><strong>{student.name}</strong></span></td><td>{student.email}</td><td>{student.department || '—'}</td><td>{student.year ? `Year ${student.year}` : '—'}</td><td>{new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</td><td><button className="button button-secondary button-small" onClick={() => setSelected(student)}>Details</button></td></tr>)}</tbody></table></div> : <EmptyState title="No students found" detail="Try searching for a different name or department." />}
    {selected && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><div className="student-detail-modal"><button className="icon-button modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><span className="profile-large-avatar">{selected.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span className="eyebrow">CAMPUS COMMUNITY</span><h2>{selected.name}</h2><p>{selected.email}</p><div className="student-detail-facts"><span><small>Department</small><strong>{selected.department || 'Not specified'}</strong></span><span><small>Year of study</small><strong>{selected.year ? `Year ${selected.year}` : 'Not specified'}</strong></span><span><small>Joined</small><strong>{new Date(selected.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong></span></div></div></div>}
  </div>;
}
