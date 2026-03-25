const summaryRows = [
  { word: 'convinced', partOfSpeech: 'adj', synonym: 'sure', antonym: 'doubtful' },
  { word: 'movement', partOfSpeech: 'noun', synonym: 'campaign', antonym: '' },
  { word: 'growing', partOfSpeech: 'adj', synonym: 'expanding', antonym: 'decreasing' },
  { word: 'activist', partOfSpeech: 'noun', synonym: 'advocate', antonym: '' },
  { word: 'true', partOfSpeech: 'adj', synonym: 'devoted', antonym: 'disloyal' },
  { word: 'navigate', partOfSpeech: 'verb', synonym: 'handle', antonym: '' },
  { word: 'collaboration', partOfSpeech: 'noun', synonym: 'partnership', antonym: '' },
  { word: 'address', partOfSpeech: 'verb', synonym: 'acknowledge', antonym: 'disregard' },
  { word: 'activate', partOfSpeech: 'verb', synonym: 'turn on', antonym: 'stop' },
  { word: 'engulf', partOfSpeech: 'verb', synonym: 'surround', antonym: '' },
  { word: 'methodically', partOfSpeech: 'adv', synonym: 'systematically', antonym: 'randomly' },
  { word: 'in unison', partOfSpeech: 'phrase', synonym: 'simultaneously', antonym: 'separately' },
  { word: 'teeming', partOfSpeech: 'adj', synonym: 'swarming', antonym: 'empty' },
  { word: 'frantically', partOfSpeech: 'adv', synonym: 'wildly', antonym: 'calmly' },
  { word: 'recede', partOfSpeech: 'verb', synonym: 'withdraw', antonym: '' },
  { word: 'accuracy', partOfSpeech: 'noun', synonym: 'precision', antonym: 'inaccuracy' },
  { word: 'benefit', partOfSpeech: 'noun', synonym: 'advantage', antonym: 'harm' },
  { word: 'advance', partOfSpeech: 'verb', synonym: 'progress', antonym: 'regress' },
  { word: 'mandate', partOfSpeech: 'verb', synonym: 'require', antonym: '' },
  { word: 'magnitude', partOfSpeech: 'noun', synonym: 'significance', antonym: 'insignificance' },
];

export default function D07SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 7 Vocabulary Summary</h1>
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
