import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';

export function getEventDate(value) {
  const date = String(value).slice(0, 10);
  return new Date(`${date}T12:00:00`);
}

export function isEventUpcoming(value) {
  const eventDate = getEventDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export function Loading({ label = 'Loading your campus...' }) {
  return <div className="loading-state"><span className="spinner" /><span>{label}</span></div>;
}

export function EmptyState({ title, detail, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><CalendarDays size={23} /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function PageHeading({ eyebrow, title, detail, action }) {
  return (
    <div className="page-heading">
      <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{detail && <p>{detail}</p>}</div>
      {action}
    </div>
  );
}

export function EventCard({ event, compact = false }) {
  const date = getEventDate(event.date);
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  return (
    <article className={`event-card ${compact ? 'event-card-compact' : ''}`}>
      <Link to={`/events/${event._id}`} className="event-image-link" aria-label={`View ${event.title}`}>
        <div className="event-image" style={{ backgroundImage: `url("${event.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}")` }}>
          <span className="category-pill">{event.category}</span>
        </div>
      </Link>
      <div className="event-card-body">
        <div className="event-date"><CalendarDays size={15} />{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <h3><Link to={`/events/${event._id}`}>{event.title}</Link></h3>
        {!compact && <p className="event-description">{event.description}</p>}
        <div className="event-meta"><span><MapPin size={15} />{event.venue}</span><span><Users size={15} />{seatsLeft} seats</span></div>
        <Link className="text-link" to={`/events/${event._id}`}>Explore event <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

export function StatusBadge({ status }) {
  const label = status === 'attended' ? 'Attended' : status === 'cancelled' ? 'Cancelled' : 'Registered';
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
