import Link from 'next/link';

type AreaLink = {
  href: string;
  label: string;
};

const areas: AreaLink[] = [
  { href: '/soy', label: 'Go to SOY Quiz List' },
  { href: '/jay', label: 'Go to JAY Quiz List' },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        padding: '40px 16px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Quiz Lists</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Select a section to continue.</p>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {areas.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                background: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              {area.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
