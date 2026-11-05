import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Compass, Menu, Sparkles, Users, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { EventCard, Loading } from '../components/Shared';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/events', { params: { upcoming: true } })
      .then(({ data }) => setEvents(data.events.slice(0, 3)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="brand-lockup"><span className="brand-mark">C</span><span>Campus<span className="brand-accent">Connect</span></span></Link>
        <button className="landing-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'landing-links landing-links-open' : 'landing-links'}>
          <a href="#how-it-works">How it works</a><a href="#events">Discover events</a>
          {user ? <Link className="button button-primary button-small" to={user.role === 'admin' ? '/admin' : '/dashboard'}>Go to dashboard <ArrowRight size={16} /></Link>
            : <><Link className="login-link" to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Join your campus <ArrowRight size={16} /></Link></>}
        </nav>
      </header>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-sparkle"><Sparkles size={14} /></span> YOUR CAMPUS, MORE CONNECTED</div>
            <h1>Make campus<br />life <span>count.</span></h1>
            <p className="hero-subtitle">Find your people, try something new, and never miss the moments that make college unforgettable.</p>
            <div className="hero-actions"><Link className="button button-primary button-large" to={user ? '/events' : '/register'}>Explore campus events <ArrowRight size={18} /></Link><a className="hero-secondary" href="#how-it-works">See how it works <ArrowUpRight size={17} /></a></div>
            <div className="hero-social-proof"><div className="avatar-stack"><span>AK</span><span>RM</span><span>JS</span><span>+</span></div><div><strong>Good things happen here</strong><small>Built for every curious student</small></div></div>
          </div>
          <div className="hero-art">
            <div className="hero-photo hero-photo-main"><img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=85" alt="Students enjoying a campus gathering" /><div className="photo-caption"><span className="caption-dot" /><span><strong>More to look forward to</strong><small>Your next favorite memory starts here</small></span></div></div>
            <div className="hero-photo hero-photo-small"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=85" alt="Students working together at a workshop" /></div>
            <div className="floating-note"><span className="floating-note-icon"><CalendarDays size={17} /></span><span><strong>Something for everyone</strong><small>Find your next thing</small></span></div>
            <span className="hero-squiggle">✳</span>
          </div>
        </section>
        <section className="trust-strip"><span>THE CAMPUS COMMUNITY, ALL IN ONE PLACE</span><div><span><Compass size={17} /> Discover</span><span><Users size={17} /> Connect</span><span><Check size={17} /> Belong</span></div></section>
        <section className="landing-events section-wrap" id="events">
          <div className="section-heading"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>There’s always something<br />happening on campus.</h2><p>From big-stage moments to small-group workshops, find your next favorite thing.</p></div><Link className="text-link" to="/events">See all events <ArrowRight size={16} /></Link></div>
          {loading ? <Loading label="Finding upcoming events..." /> : error ? <div className="inline-error">{error}</div> : events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event._id} event={event} />)}</div> : <div className="empty-landing">New events are on the way. Check back soon.</div>}
        </section>
        <section className="how-section" id="how-it-works"><div className="how-inner"><div><span className="eyebrow">CAMPUS LIFE, SIMPLIFIED</span><h2>Less searching.<br /><span>More showing up.</span></h2><p>CampusConnect brings all the good stuff together, so you can spend less time looking and more time being part of it.</p><Link className="button button-light button-large" to={user ? '/events' : '/register'}>Find your next event <ArrowRight size={17} /></Link></div><div className="how-steps"><div className="how-step"><span>01</span><div><strong>Find your thing</strong><p>Browse events picked for your campus and interests.</p></div></div><div className="how-step"><span>02</span><div><strong>Save your seat</strong><p>Register in a few taps and keep your plans in one place.</p></div></div><div className="how-step"><span>03</span><div><strong>Show up & connect</strong><p>Meet your people and make the most of campus life.</p></div></div></div></div></section>
        <section className="landing-cta"><div className="cta-icon"><Sparkles size={22} /></div><h2>Your campus has a lot<br />going on. <span>Be part of it.</span></h2><p>Make this semester the one you talk about.</p><Link to={user ? '/events' : '/register'} className="button button-primary button-large">Get started — it’s free <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="landing-footer"><Link to="/" className="brand-lockup"><span className="brand-mark">C</span><span>Campus<span className="brand-accent">Connect</span></span></Link><span>Made for campus, made for you.</span><span>© {new Date().getFullYear()} CampusConnect</span></footer>
    </div>
  );
}
