const summaryRows = [
  { word: 'bucket list', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'activate', partOfSpeech: 'verb', synonym: 'initiate', antonym: 'halt' },
  { word: 'injustice', partOfSpeech: 'noun', synonym: 'oppression', antonym: '' },
  { word: 'ache for', partOfSpeech: 'phr. verb', synonym: 'crave', antonym: '' },
  { word: 'associate with', partOfSpeech: 'phr. verb', synonym: 'correlate with', antonym: 'dissociate with' },
  { word: 'applause', partOfSpeech: 'noun', synonym: 'clapping', antonym: 'booing' },
  { word: 'mentoring', partOfSpeech: 'noun', synonym: 'counseling', antonym: '' },
  { word: 'take action', partOfSpeech: 'phr. verb', synonym: '', antonym: 'neglect' },
  { word: 'rigorous', partOfSpeech: 'adj', synonym: 'thorough', antonym: 'careless' },
  { word: 'intricate', partOfSpeech: 'adj', synonym: 'elaborate', antonym: 'simple' },
  { word: 'plummet', partOfSpeech: 'verb', synonym: 'plunge', antonym: '' },
  { word: 'pulverized', partOfSpeech: 'adj', synonym: 'crushed', antonym: '' },
  { word: 'sensitive', partOfSpeech: 'adj', synonym: 'keen', antonym: 'dull' },
  { word: 'triumphant', partOfSpeech: 'adj', synonym: 'successful', antonym: '' },
  { word: 'demeanor', partOfSpeech: 'noun', synonym: 'manner', antonym: '' },
  { word: 'contribution', partOfSpeech: 'noun', synonym: 'donation', antonym: '' },
  { word: 'compulsory', partOfSpeech: 'adj', synonym: 'mandatory', antonym: 'optional' },
  { word: 'motivation', partOfSpeech: 'noun', synonym: 'ambition', antonym: 'reluctance' },
  { word: 'adverse', partOfSpeech: 'adj', synonym: 'detrimental', antonym: 'beneficial' },
  { word: 'capacity', partOfSpeech: 'noun', synonym: 'capability', antonym: 'inability' },
];

export default function D08SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 8 Vocabulary Summary</h1>
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
