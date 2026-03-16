const summaryRows = [
  { word: 'changemaker', partOfSpeech: 'noun', synonym: 'reformer', antonym: '' },
  { word: 'intention', partOfSpeech: 'noun', synonym: 'aim', antonym: '' },
  { word: 'marine', partOfSpeech: 'adj', synonym: 'aquatic', antonym: 'terrestrial' },
  { word: 'innovative', partOfSpeech: 'adj', synonym: 'ingenious', antonym: 'old-fashioned' },
  { word: 'mission', partOfSpeech: 'noun', synonym: 'objective', antonym: '' },
  { word: 'reduce', partOfSpeech: 'verb', synonym: 'decrease', antonym: 'increase' },
  { word: 'typical', partOfSpeech: 'adj', synonym: 'ordinary', antonym: 'extraordinary' },
  { word: 'microfiber', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'conversion', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'scrawl', partOfSpeech: 'verb', synonym: 'scribble', antonym: '' },
  { word: 'deliberately', partOfSpeech: 'adv', synonym: 'intentionally', antonym: '' },
  { word: 'conserve', partOfSpeech: 'verb', synonym: 'preserve', antonym: 'waste' },
  { word: 'cooperate', partOfSpeech: 'verb', synonym: 'collaborate', antonym: '' },
  { word: 'briskly', partOfSpeech: 'adv', synonym: 'swiftly', antonym: 'slowly' },
  { word: 'chime', partOfSpeech: 'verb', synonym: '', antonym: '' },
  { word: 'tumult', partOfSpeech: 'noun', synonym: 'ruckus', antonym: '' },
  { word: 'dissenting', partOfSpeech: 'adj', synonym: 'disagreeing', antonym: 'assenting' },
  { word: 'unnecessary', partOfSpeech: 'adj', synonym: 'needless', antonym: 'necessary' },
  { word: 'disagreement', partOfSpeech: 'noun', synonym: 'dispute', antonym: 'agreement' },
  { word: 'call to action', partOfSpeech: 'phrase', synonym: 'appeal', antonym: '' },
];

export default function D06SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 6 Vocabulary Summary</h1>
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
