const summaryRows = [
  { word: 'inventive', partOfSpeech: 'adj.', synonym: 'innovative', antonym: 'dull' },
  { word: 'suspiciously', partOfSpeech: 'adv.', synonym: 'doubtfully', antonym: 'trustingly' },
  { word: 'scooch', partOfSpeech: 'v.', synonym: '', antonym: '' },
  { word: 'truce', partOfSpeech: 'n.', synonym: 'agreement', antonym: '' },
  { word: 'impressed', partOfSpeech: 'adj.', synonym: 'amazed', antonym: '' },
  { word: 'obstacle', partOfSpeech: 'n.', synonym: 'barrier', antonym: '' },
  { word: 'consider', partOfSpeech: 'v.', synonym: 'contemplate', antonym: '' },
  { word: 'embrace', partOfSpeech: 'v.', synonym: 'welcome', antonym: 'reject' },
  { word: 'negotiate', partOfSpeech: 'v.', synonym: 'bargain', antonym: '' },
  { word: 'engaged', partOfSpeech: 'adj.', synonym: 'committed', antonym: 'inactive' },
  { word: 'referral', partOfSpeech: 'n.', synonym: '', antonym: '' },
  { word: 'generation', partOfSpeech: 'n.', synonym: 'age', antonym: '' },
  { word: 'affirmative', partOfSpeech: 'adj.', synonym: 'assenting', antonym: 'dissenting' },
  { word: 'assertion', partOfSpeech: 'n.', synonym: 'declaration', antonym: 'question' },
  { word: 'outcome', partOfSpeech: 'n.', synonym: 'result', antonym: 'cause' },
  { word: 'evidence', partOfSpeech: 'n.', synonym: 'proof', antonym: '' },
  { word: 'crumple', partOfSpeech: 'v.', synonym: 'scrunch', antonym: 'smooth' },
  { word: 'interjection', partOfSpeech: 'n.', synonym: 'exclamation', antonym: '' },
  { word: 'snarly', partOfSpeech: 'adj.', synonym: 'bad-tempered', antonym: '' },
  { word: 'skirmish', partOfSpeech: 'n.', synonym: 'fight', antonym: '' },
];

export default function D04SummaryPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Week 4 Vocabulary Summary</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#4b5563', fontSize: 14 }}>
          Vocabulary Summary Table
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
