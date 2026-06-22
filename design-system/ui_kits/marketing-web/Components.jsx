// Marketing web UI kit — core components
// Depends on window.React, window.ReactDOM already loaded by index.html

const { useState } = React;

const Logo = ({ size = 140 }) => (
  <img src="../../assets/logo-black.png" alt="mBOLDen Change" style={{ maxWidth: size, display: 'block' }} />
);

const Header = ({ active = 'Our Work', onNav }) => {
  const links = ['Our Work', 'Impact', 'Partners', 'About'];
  return (
    <header style={mcStyles.header}>
      <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav('Home'); }}>
        <Logo size={140} />
      </a>
      <nav style={mcStyles.nav}>
        {links.map(l => (
          <a key={l} href="#" onClick={(e) => { e.preventDefault(); onNav && onNav(l); }}
             className="mc-navlink" data-active={active === l}>
            {l}
          </a>
        ))}
        <a href="#" className="mc-donate" onClick={(e) => e.preventDefault()}>Donate</a>
      </nav>
    </header>
  );
};

const Hero = ({ eyebrow, title, body, cta, image }) => (
  <section style={{ ...mcStyles.hero, backgroundImage: `url(${image})` }}>
    <div style={mcStyles.heroOverlay}>
      {eyebrow && <div className="mc-eyebrow" style={{ color: '#fff', marginBottom: 12 }}>{eyebrow}</div>}
      <h1 style={mcStyles.heroHeadline}>{title}</h1>
      {body && <p style={mcStyles.heroBody}>{body}</p>}
      {cta && <a href="#" className="mc-btn-skew" onClick={(e) => e.preventDefault()}>{cta}</a>}
    </div>
  </section>
);

const StatementBanner = ({ bg = '#fad826', color = '#000', headline, body, ctaLabel = 'Read our full statement' }) => (
  <section style={{ background: bg, color, padding: '64px 32px', textAlign: 'center' }}>
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.25, margin: '0 auto 1.25rem' }}>{headline}</h3>
      <p style={{ fontSize: 18, lineHeight: 1.6, margin: '0 auto 1.75rem', whiteSpace: 'pre-line' }}>{body}</p>
      <a href="#" className="mc-stmt-cta" onClick={(e) => e.preventDefault()} style={{ color }}>{ctaLabel}</a>
    </div>
  </section>
);

const PillarCard = ({ headline, body, tint = 'var(--brand-fuchsia)' }) => (
  <div className="mc-pillar" style={{ borderColor: tint }}>
    <div style={{ width: '60%', aspectRatio: '1/1', background: `linear-gradient(135deg, ${tint}, var(--brand-aqua-teal))`, borderRadius: 12, margin: '0 auto 16px' }} />
    <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 22, textAlign: 'center', margin: '8px 0 12px' }}>{headline}</h3>
    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(0,0,0,.85)', margin: 0 }}>{body}</p>
  </div>
);

const Pillars = ({ title, description, items }) => (
  <section style={{ padding: 32, background: '#f9f9f9' }}>
    <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '2.25rem', textAlign: 'center', margin: '0 0 12px', color: '#222' }}>{title}</h2>
    {description && <p style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px', lineHeight: 1.6, color: 'rgba(0,0,0,.85)' }}>{description}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
      {items.map((it, i) => <PillarCard key={i} {...it} />)}
    </div>
  </section>
);

const CaseStudyHighlight = ({ label, quote, headline, body, ctaLabel = 'Read the case study' }) => (
  <section style={{ background: '#fff', padding: 'clamp(2rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(1rem, 4vw, 3rem)' }} className="mc-csh-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="mc-eyebrow">{label}</div>
        <div style={{ position: 'relative', paddingLeft: 'calc(56px + 1rem)' }}>
          <img src="../../assets/quote-fuchsia.png" alt="" style={{ position: 'absolute', left: 0, top: -6, width: 50 }} />
          <p style={{ margin: 0, fontSize: '1.35rem', lineHeight: 1.4, fontWeight: 600, color: 'var(--brand-fuchsia)' }}>{quote}</p>
        </div>
        <div style={{ width: '100%', aspectRatio: '4/3', background: 'linear-gradient(135deg,#0091ad,#b22f93)', clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)', marginTop: '1rem' }} />
      </div>
      <div>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: 'clamp(1.75rem, 2.8vw, 2.25rem)', lineHeight: 1.25, fontFamily: 'var(--font-headline)', fontWeight: 700 }}>{headline}</h2>
        <p style={{ margin: '0 0 1.75rem', fontSize: '1.125rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{body}</p>
        <a href="#" className="mc-csh-cta" onClick={(e) => e.preventDefault()}>{ctaLabel}</a>
      </div>
    </div>
  </section>
);

const TestimonialSection = ({ headline, quote, credit, credentials }) => (
  <section style={{ background: 'var(--brand-aqua-teal)', padding: '3rem 1.5rem' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 32, alignItems: 'center' }} className="mc-tst-grid">
      <div style={{ background: '#fff', padding: '1rem 1rem 2.5rem', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ width: '100%', aspectRatio: '4/5', background: 'linear-gradient(135deg,#b22f93,#fad826)', borderRadius: 0 }} />
        <div style={{ marginTop: '1rem', fontSize: 13, fontStyle: 'italic', color: 'rgba(0,0,0,.8)' }}>Partner gathering · Oakland, 2024</div>
      </div>
      <div>
        <h2 style={{ color: '#fff', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '2rem', lineHeight: 1.2, padding: '1rem', margin: 0 }}>{headline}</h2>
        <div style={{ position: 'relative', padding: '2rem', margin: '2rem 0 0.5rem 1.5rem', background: '#fff', borderRadius: 16 }}>
          <img src="../../assets/quote-fuchsia.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: 50, transform: 'translate(-25%,-25%) rotate(-12deg)' }} />
          <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0 }}>{quote}</p>
        </div>
        <div style={{ padding: '1.5rem 0 0.5rem 1.5rem', color: '#fff', fontSize: 20 }}>{credit}</div>
        {credentials && <div style={{ padding: '0 0 1.5rem 1.5rem', color: '#fff', fontSize: 16, opacity: 0.9 }}>{credentials}</div>}
      </div>
    </div>
  </section>
);

const Footer = ({ onNewsletterClick }) => (
  <footer style={{ background: '#000', color: '#fff', padding: '48px 48px 24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1280, margin: '0 auto' }} className="mc-foot-grid">
      <div>
        <img src="../../assets/logo-black.png" alt="" style={{ maxWidth: 160, filter: 'invert(1)', marginBottom: 12 }} />
        <address style={{ fontStyle: 'normal', fontSize: 14, color: '#ccc', lineHeight: 1.6 }}>
          <div>3 Waters Park Drive, Suite 224</div>
          <div>San Mateo, CA 94403</div>
          <div style={{ marginTop: 8 }}><a href="mailto:info@mboldenchange.org" style={{ color: '#e2e2e2', textDecoration: 'underline', fontSize: 13 }}>info@mboldenchange.org</a></div>
        </address>
      </div>
      {[
        { title: 'Our Work', links: ['Direct Cash', 'Partner Initiatives', 'Policy Advocacy', 'Case Studies'] },
        { title: 'Resources', links: ['Statements', 'Reports', 'Press', 'Annual Letter'] }
      ].map((col) => (
        <div key={col.title}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, marginBottom: 8 }}>{col.title}</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
            {col.links.map(l => <li key={l}><a href="#" className="mc-footlink" onClick={(e) => e.preventDefault()}>{l}</a></li>)}
          </ul>
        </div>
      ))}
      <div>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 24, marginBottom: 8 }}>Connect with us</h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {['IG', 'LI', 'FB'].map(l => (
            <div key={l} style={{ width: 40, height: 40, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{l}</div>
          ))}
        </div>
        <a href="#" className="mc-newsletter" onClick={(e) => { e.preventDefault(); onNewsletterClick && onNewsletterClick(); }}>Sign up for our Newsletter</a>
      </div>
    </div>
    <div style={{ borderTop: '1px solid #222', marginTop: 40, paddingTop: 18, display: 'flex', justifyContent: 'space-between', maxWidth: 1280, marginInline: 'auto', flexWrap: 'wrap', gap: 16 }}>
      <p style={{ fontSize: 18, margin: 0 }}>mBOLDen Change is a 501(c)(3) nonprofit · EIN 20-XXXXXXX</p>
      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>© 2026 mBOLDen Change. All rights reserved.</p>
    </div>
  </footer>
);

const NewsletterModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', padding: 32, borderRadius: 16, maxWidth: 440, width: '90%', boxShadow: 'var(--shadow-raised)' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 28, marginBottom: 8 }}>Stay in the work with us</h2>
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,.8)', marginBottom: 20, lineHeight: 1.5 }}>Quarterly updates on our partners, reports, and policy wins. No spam.</p>
        <input placeholder="First name" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />
        <input placeholder="Email address" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, marginBottom: 16, fontSize: 14, boxSizing: 'border-box' }} />
        <a href="#" className="mc-btn-skew" onClick={(e) => { e.preventDefault(); onClose(); }}>Subscribe</a>
        <button onClick={onClose} style={{ marginLeft: 20, background: 'transparent', border: 'none', color: 'var(--brand-fuchsia)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
};

Object.assign(window, { Header, Hero, StatementBanner, Pillars, PillarCard, CaseStudyHighlight, TestimonialSection, Footer, NewsletterModal, Logo });
