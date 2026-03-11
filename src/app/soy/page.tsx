import Link from 'next/link';
import { access, readdir } from 'fs/promises';
import path from 'path';

type QuizLink = {
  href: string;
  label: string;
  isHighlighted?: boolean;
};

async function getNumericQuizLinks(track: 'c' | 'd'): Promise<QuizLink[]> {
  const baseDir = path.join(process.cwd(), 'src/app/soy', track);

  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    const links: QuizLink[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;

      const pagePath = path.join(baseDir, entry.name, 'page.tsx');
      try {
        await access(pagePath);
        const isHighlighted = entry.name === '05' || entry.name === '06';
        links.push({
          href: `/soy/${track}/${entry.name}`,
          label: `${track}/${entry.name}`,
          isHighlighted,
        });
      } catch {
        // skip directories without page.tsx
      }
    }

    return links.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function getSummaryLinks(): Promise<QuizLink[]> {
  const baseDir = path.join(process.cwd(), 'src/app/soy/d');
  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    const links: QuizLink[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
      const summaryPath = path.join(baseDir, entry.name, 'summary', 'page.tsx');
      try {
        await access(summaryPath);
        links.push({
          href: `/soy/d/${entry.name}/summary`,
          label: `d/${entry.name}/summary`,
        });
      } catch {
        // skip
      }
    }

    return links.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
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
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>No links yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {links.map((link) => {
            const isHighlight = Boolean(link.isHighlighted);
            return (
            <Link
              key={link.href}
              href={link.href}
              title={isHighlight ? 'New quiz' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
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
              <span>{link.label}</span>
              {isHighlight && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 999,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  NEW
                </span>
              )}
            </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default async function SoyQuizHome() {
  const [cLinks, dLinks, summaryLinks] = await Promise.all([
    getNumericQuizLinks('c'),
    getNumericQuizLinks('d'),
    getSummaryLinks(),
  ]);

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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>SOY Quiz List</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>All SOY tracks and summary pages</p>
        </header>

        <div style={{ display: 'grid', gap: 14 }}>
          <LinkSection title="soy/c" links={cLinks} />
          <LinkSection title="soy/d" links={dLinks} />
          <LinkSection title="soy/d summary" links={summaryLinks} />
        </div>
      </div>
    </main>
  );
}
