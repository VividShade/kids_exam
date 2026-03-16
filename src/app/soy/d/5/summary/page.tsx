const summaryRows = [
  { word: 'aspire', partOfSpeech: 'verb', synonym: 'desire', antonym: '' },
  { word: 'make room', partOfSpeech: 'phrasal verb', synonym: 'accommodate', antonym: '' },
  { word: 'concerned', partOfSpeech: 'adj', synonym: 'distressed', antonym: 'calm' },
  { word: 'donate', partOfSpeech: 'verb', synonym: 'contribute', antonym: '' },
  { word: 'annual', partOfSpeech: 'adj', synonym: 'yearly', antonym: '' },
  { word: 'non-profit', partOfSpeech: 'adj', synonym: 'charitable', antonym: 'profitmaking' },
  { word: 'charity', partOfSpeech: 'noun', synonym: '', antonym: 'business' },
  { word: 'put into perspective', partOfSpeech: 'phrase', synonym: '', antonym: '' },
  { word: 'independent', partOfSpeech: 'adj', synonym: 'autonomous', antonym: 'dependent' },
  { word: 'orderly', partOfSpeech: 'adj', synonym: 'neat', antonym: 'disorderly' },
  { word: 'immature', partOfSpeech: 'adj', synonym: 'childish', antonym: 'mature' },
  { word: 'disciplined', partOfSpeech: 'adj', synonym: 'restrained', antonym: 'unrestrained' },
  { word: 'incident', partOfSpeech: 'noun', synonym: 'episode', antonym: '' },
  { word: 'preliminary', partOfSpeech: 'adj', synonym: 'introductory', antonym: 'final' },
  { word: 'inventive', partOfSpeech: 'adj', synonym: 'innovative', antonym: 'dull' },
  { word: 'deliberately', partOfSpeech: 'adv', synonym: 'intentionally', antonym: '' },
  { word: 'community service', partOfSpeech: 'noun', synonym: 'volunteering', antonym: '' },
  { word: 'invaluable', partOfSpeech: 'adj', synonym: 'beneficial', antonym: 'pointless' },
  { word: 'advocate', partOfSpeech: 'verb', synonym: 'propose', antonym: 'condemn' },
  { word: 'critical thinking', partOfSpeech: 'noun', synonym: 'analysis', antonym: '' },
];

export default function D05SummaryPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 5 Vocabulary Summary</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#4b5563', fontSize: 14 }}>
          Vocabulary Table
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ border: '1px solid #e5e7eb', textAlign: 'left', padding: 10 }}>Word</th>
                <th style={{ border: '1px solid #e5e7eb', textAlign: 'left', padding: 10 }}>Part of Speech</th>
                <th style={{ border: '1px solid #e5e7eb', textAlign: 'left', padding: 10 }}>Synonym</th>
                <th style={{ border: '1px solid #e5e7eb', textAlign: 'left', padding: 10 }}>Antonym</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.word}>
                  <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{row.word}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{row.partOfSpeech}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{row.synonym}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{row.antonym}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
