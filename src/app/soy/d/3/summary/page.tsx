const summaryRows = [
  { word: 'entrepreneur', partOfSpeech: 'noun', synonym: 'businessman', antonym: '' },
  { word: 'investment', partOfSpeech: 'noun', synonym: '', antonym: '' },
  { word: 'turn down', partOfSpeech: 'verb', synonym: 'reject', antonym: 'accept' },
  { word: 'rejection', partOfSpeech: 'noun', synonym: 'denial', antonym: 'approval' },
  { word: 'click', partOfSpeech: 'verb', synonym: 'dawn on', antonym: '' },
  { word: 'personally', partOfSpeech: 'adverb', synonym: 'individually', antonym: 'generally' },
  { word: 'desensitize', partOfSpeech: 'verb', synonym: 'deaden', antonym: '' },
  { word: 'menacing', partOfSpeech: 'adj', synonym: 'threatening', antonym: '' },
  { word: 'custodian', partOfSpeech: 'noun', synonym: 'janitor', antonym: '' },
  { word: 'incident', partOfSpeech: 'noun', synonym: 'episode', antonym: '' },
  { word: 'sly', partOfSpeech: 'adj', synonym: 'cunning', antonym: 'honest' },
  { word: 'penalty', partOfSpeech: 'noun', synonym: '', antonym: 'reward' },
  { word: 'preliminary', partOfSpeech: 'adj', synonym: 'introductory', antonym: 'final' },
  { word: 'quivering', partOfSpeech: 'adj', synonym: 'shivering', antonym: '' },
  { word: 'conquer', partOfSpeech: 'verb', synonym: 'subjugate', antonym: 'lose' },
  { word: 'maniac', partOfSpeech: 'noun', synonym: 'madman', antonym: '' },
  { word: 'foundation', partOfSpeech: 'noun', synonym: 'basis', antonym: '' },
  { word: 'objective', partOfSpeech: 'noun', synonym: 'aim', antonym: '' },
  { word: 'impact', partOfSpeech: 'noun', synonym: 'effect', antonym: '' },
  { word: 'honorable', partOfSpeech: 'adj', synonym: 'respectable', antonym: 'dishonorable' },
];

export default function D03SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 3 Vocabulary Summary</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#4b5563', fontSize: 14 }}>
          Part 4. Vocabulary Table
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
