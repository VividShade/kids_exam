const summaryRows = [
  { word: 'instant messaging', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'emoticon', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'punctuation', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'symbol', partOfSpeech: 'noun', synonym: 'sign', antonym: '' },
  { word: 'emoji', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'network', partOfSpeech: 'noun', synonym: 'grid', antonym: '' },
  { word: 'indirect', partOfSpeech: 'adj', synonym: 'roundabout', antonym: 'direct' },
  { word: 'universal', partOfSpeech: 'adj', synonym: 'common', antonym: 'uncommon' },
  { word: 'attentive', partOfSpeech: 'adj', synonym: 'watchful', antonym: 'inattentive' },
  { word: 'gratitude', partOfSpeech: 'noun', synonym: 'thankfulness', antonym: '' },
  { word: 'surrender', partOfSpeech: 'verb', synonym: 'give up', antonym: 'fight' },
  { word: 'dreary', partOfSpeech: 'adj', synonym: 'gloomy', antonym: 'bright' },
  { word: 'inoperative', partOfSpeech: 'adj', synonym: 'defective', antonym: 'operative' },
  { word: 'procession', partOfSpeech: 'noun', synonym: 'parade', antonym: '' },
  { word: 'modification', partOfSpeech: 'noun', synonym: 'alteration', antonym: '' },
  { word: 'indestructible', partOfSpeech: 'adj', synonym: 'durable', antonym: 'fragile' },
  { word: 'stand for', partOfSpeech: 'phrasal verb', synonym: 'support', antonym: 'disagree with' },
  { word: 'observe', partOfSpeech: 'verb', synonym: 'see', antonym: '' },
  { word: 'urge', partOfSpeech: 'verb', synonym: 'encourage', antonym: 'discourage' },
  { word: 'call on', partOfSpeech: 'verb', synonym: 'request', antonym: 'demand' },
];

export default function D09SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 9 Vocabulary Summary</h1>
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
