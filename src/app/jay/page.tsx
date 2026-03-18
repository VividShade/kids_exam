import { readdir } from 'fs/promises';
import Link from 'next/link';
import path from 'path';

type QuizLink = {
  href: string;
  label: string;
  isHighlighted?: boolean;
};

async function findQuizPages(dir: string, hrefPrefix: string): Promise<QuizLink[]> {
  const links: QuizLink[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  const hasPage = entries.some((entry) => entry.isFile() && entry.name === 'page.tsx');
  if (hasPage) {
    links.push({
      href: hrefPrefix,
      label: hrefPrefix.replace(/^\//, ''),
      isHighlighted: hrefPrefix === '/jay/wonders/5-2' || hrefPrefix === '/jay/mcr/5-2',
    });
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const childDir = path.join(dir, entry.name);
    const childHref = `${hrefPrefix}/${entry.name}`;
    const childLinks = await findQuizPages(childDir, childHref);
    links.push(...childLinks);
  }

  return links;
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

function groupByTopDir(links: QuizLink[]): Record<string, QuizLink[]> {
  const grouped: Record<string, QuizLink[]> = {};

  for (const link of links) {
    const parts = link.href.split('/').filter(Boolean);
    const category = parts[1] ?? 'other';

    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({
      href: link.href,
      label: parts.slice(1).join('/'),
      isHighlighted: link.isHighlighted,
    });
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }

  return grouped;
}

export default async function JayQuizHome() {
  const baseDir = path.join(process.cwd(), 'src/app/jay');
  const allLinks = await findQuizPages(baseDir, '/jay');
  const grouped = groupByTopDir(allLinks);

  const orderedSections = ['mcr', 'wonders', 'grammar', 'wordly'];

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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>JAY Quiz List</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>All JAY quiz pages</p>
        </header>

        <div style={{ display: 'grid', gap: 14 }}>
          {orderedSections
            .map((category) => ({ category, links: grouped[category] ?? [] }))
            .filter(({ links }) => links.length > 0)
            .map(({ category, links }) => (
              <LinkSection key={category} title={`jay/${category}`} links={links} />
            ))}
        </div>
      </div>
    </main>
  );
}
