import Link from 'next/link';
import { readdir } from 'fs/promises';
import path from 'path';

type QuizLink = {
  href: string;
  label: string;
};

const summaryLinks: QuizLink[] = [
  { href: '/soy/d/03/summary', label: 'soy/d/03/summary' },
  { href: '/soy/d/04/summary', label: 'soy/d/04/summary' },
];

async function getSoyLinks(track: 'c' | 'd'): Promise<QuizLink[]> {
  const baseDir = path.join(process.cwd(), 'src/app/soy', track);

  try {
    const entries = await readdir(baseDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
      .map((entry) => ({
        href: `/soy/${track}/${entry.name}`,
        label: `soy/${track}/${entry.name}`,
      }))
      .sort((a, b) => a.href.localeCompare(b.href, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

function LinkSection({ title, links }: { title: string; links: QuizLink[] }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h2>

      {links.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>링크가 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                background: '#f8fafc',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [cLinks, dLinks] = await Promise.all([getSoyLinks('c'), getSoyLinks('d')]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        padding: '40px 16px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>SOY Quiz Shortcuts</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
            `soy/c/**`, `soy/d/**` 경로의 바로가기를 모아둔 페이지입니다.
          </p>
        </header>

        <div style={{ display: 'grid', gap: 14 }}>
          <LinkSection title="soy/c/**" links={cLinks} />
          <LinkSection title="soy/d/**" links={dLinks} />
          <LinkSection title="soy/d/**/summary" links={summaryLinks} />
        </div>
      </div>
    </main>
  );
}
