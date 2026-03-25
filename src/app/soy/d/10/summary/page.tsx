const summaryRows = [
  { word: 'replace', partOfSpeech: 'verb', synonym: 'substitute', antonym: '' },
  { word: 'reflect', partOfSpeech: 'verb', synonym: 'represent', antonym: '' },
  { word: 'reduction', partOfSpeech: 'noun', synonym: 'contraction', antonym: 'expansion' },
  { word: 'informal', partOfSpeech: 'adj', synonym: 'casual', antonym: 'formal' },
  { word: 'distinguish', partOfSpeech: 'verb', synonym: 'differentiate', antonym: '' },
  { word: 'regress', partOfSpeech: 'verb', synonym: 'revert', antonym: 'progress' },
  { word: 'supporter', partOfSpeech: 'noun', synonym: 'advocate', antonym: 'opponent' },
  { word: 'convenient', partOfSpeech: 'adj', synonym: 'handy', antonym: 'inconvenient' },
  { word: 'instinct', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'rouse', partOfSpeech: 'verb', synonym: 'awake', antonym: '' },
  { word: 'vicious', partOfSpeech: 'adj', synonym: 'fierce', antonym: 'gentle' },
  { word: 'weary', partOfSpeech: 'adj', synonym: 'exhausted', antonym: 'energetic' },
  { word: 'consult', partOfSpeech: 'verb', synonym: '', antonym: '' },
  { word: 'smothering', partOfSpeech: 'adj', synonym: 'enveloping', antonym: '' },
  { word: 'greenhouse', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'mingle', partOfSpeech: 'verb', synonym: 'socialize', antonym: '' },
  { word: 'satisfaction', partOfSpeech: 'noun', synonym: 'contentment', antonym: 'displeasure' },
  { word: 'variation', partOfSpeech: 'noun', synonym: 'discrepancy', antonym: 'similarity' },
  { word: 'literacy', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'numeracy', partOfSpeech: 'noun', synonym: '', antonym: '' },
];

export default function D10SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 10 Vocabulary Summary</h1>
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
