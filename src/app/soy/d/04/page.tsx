'use client';

import { useState } from 'react';

type McQuestion = {
  id: number;
  type: 'mc';
  text: string;
  options: string[];
  correctIndex: number;
};

type SpellingQuestion = {
  id: number;
  type: 'spelling';
  text: string;
  answer: string;
};

type Question = McQuestion | SpellingQuestion;

type Answer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type VocabRow = {
  word: string;
  pos: string;
  synonym: string;
  antonym: string;
};

const questions: Question[] = [
  // Part A - Multiple Choice
  {
    id: 1,
    type: 'mc',
    text: 'Someone who is very good at thinking of new ideas is',
    options: ['dull', 'inventive', 'inactive', 'suspiciously'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'If someone looks at you in a way that makes you think something is wrong, they look at you',
    options: ['trustingly', 'suspiciously', 'warmly', 'smoothly'],
    correctIndex: 1,
  },
  {
    id: 3,
    type: 'mc',
    text: 'To move a short distance while sitting is to',
    options: ['scooch', 'crumple', 'negotiate', 'snarl'],
    correctIndex: 0,
  },
  {
    id: 4,
    type: 'mc',
    text: 'A peaceful agreement to stop fighting for a time is called a',
    options: ['skirmish', 'truce', 'assertion', 'barrier'],
    correctIndex: 1,
  },
  {
    id: 5,
    type: 'mc',
    text: 'Feeling admiration or respect for someone means you are',
    options: ['impressed', 'inactive', 'snarly', 'doubtful'],
    correctIndex: 0,
  },
  {
    id: 6,
    type: 'mc',
    text: 'Something that blocks your progress is an',
    options: ['obstacle', 'outcome', 'interjection', 'generation'],
    correctIndex: 0,
  },
  {
    id: 7,
    type: 'mc',
    text: 'To think carefully about something before making a decision is to',
    options: ['embrace', 'consider', 'bargain', 'reject'],
    correctIndex: 1,
  },
  {
    id: 8,
    type: 'mc',
    text: 'To accept something with enthusiasm is to',
    options: ['reject', 'embrace', 'crumple', 'snarl'],
    correctIndex: 1,
  },
  {
    id: 9,
    type: 'mc',
    text: 'To have formal discussions in order to reach an agreement is to',
    options: ['negotiate', 'scooch', 'scrunch', 'assert'],
    correctIndex: 0,
  },
  {
    id: 10,
    type: 'mc',
    text: 'If students are involved in a lesson, they are',
    options: ['inactive', 'engaged', 'doubtful', 'smooth'],
    correctIndex: 1,
  },
  {
    id: 11,
    type: 'mc',
    text: 'When a doctor sends you to a specialist, that is a',
    options: ['referral', 'skirmish', 'truce', 'proof'],
    correctIndex: 0,
  },
  {
    id: 12,
    type: 'mc',
    text: 'All the people of about the same age in society are a',
    options: ['barrier', 'generation', 'result', 'cause'],
    correctIndex: 1,
  },
  {
    id: 13,
    type: 'mc',
    text: 'Showing agreement or approval is',
    options: ['dissenting', 'affirmative', 'doubtful', 'snarly'],
    correctIndex: 1,
  },
  {
    id: 14,
    type: 'mc',
    text: 'A statement someone strongly believes is true is an',
    options: ['outcome', 'assertion', 'obstacle', 'interjection'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: 'A result of an action is an',
    options: ['outcome', 'cause', 'barrier', 'referral'],
    correctIndex: 0,
  },
  {
    id: 16,
    type: 'mc',
    text: 'Facts that help prove something is true are',
    options: ['generation', 'evidence', 'fight', 'bargain'],
    correctIndex: 1,
  },
  {
    id: 17,
    type: 'mc',
    text: 'To crush paper into wrinkles is to',
    options: ['scooch', 'crumple', 'negotiate', 'embrace'],
    correctIndex: 1,
  },
  {
    id: 18,
    type: 'mc',
    text: 'A short expression of emotion like "Wow!" is an',
    options: ['outcome', 'interjection', 'barrier', 'truce'],
    correctIndex: 1,
  },
  {
    id: 19,
    type: 'mc',
    text: 'Easily angered and aggressive describes someone who is',
    options: ['snarly', 'impressed', 'engaged', 'inventive'],
    correctIndex: 0,
  },
  {
    id: 20,
    type: 'mc',
    text: 'A short argument is a',
    options: ['truce', 'skirmish', 'proof', 'catalyst'],
    correctIndex: 1,
  },

  // Part B - Synonym / Antonym
  {
    id: 21,
    type: 'mc',
    text: 'inventive',
    options: ['innovative', 'dull'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'suspiciously',
    options: ['doubtfully', 'trustingly'],
    correctIndex: 0,
  },
  {
    id: 23,
    type: 'mc',
    text: 'scooch',
    options: ['move slightly', 'remain still'],
    correctIndex: 0,
  },
  {
    id: 24,
    type: 'mc',
    text: 'truce',
    options: ['agreement', 'fight'],
    correctIndex: 0,
  },
  {
    id: 25,
    type: 'mc',
    text: 'impressed',
    options: ['amazed', 'bored'],
    correctIndex: 0,
  },
  {
    id: 26,
    type: 'mc',
    text: 'obstacle',
    options: ['barrier', 'catalyst'],
    correctIndex: 0,
  },
  {
    id: 27,
    type: 'mc',
    text: 'consider',
    options: ['contemplate', 'ignore'],
    correctIndex: 0,
  },
  {
    id: 28,
    type: 'mc',
    text: 'embrace',
    options: ['welcome', 'reject'],
    correctIndex: 0,
  },
  {
    id: 29,
    type: 'mc',
    text: 'negotiate',
    options: ['bargain', 'argue violently'],
    correctIndex: 0,
  },
  {
    id: 30,
    type: 'mc',
    text: 'engaged',
    options: ['committed', 'inactive'],
    correctIndex: 0,
  },
  {
    id: 31,
    type: 'mc',
    text: 'affirmative',
    options: ['assenting', 'dissenting'],
    correctIndex: 0,
  },
  {
    id: 32,
    type: 'mc',
    text: 'assertion',
    options: ['declaration', 'question'],
    correctIndex: 0,
  },
  {
    id: 33,
    type: 'mc',
    text: 'outcome',
    options: ['result', 'cause'],
    correctIndex: 0,
  },
  {
    id: 34,
    type: 'mc',
    text: 'evidence',
    options: ['proof', 'opinion'],
    correctIndex: 0,
  },
  {
    id: 35,
    type: 'mc',
    text: 'crumple',
    options: ['scrunch', 'smooth'],
    correctIndex: 0,
  },
  {
    id: 36,
    type: 'mc',
    text: 'interjection',
    options: ['exclamation', 'paragraph'],
    correctIndex: 0,
  },
  {
    id: 37,
    type: 'mc',
    text: 'snarly',
    options: ['bad-tempered', 'calm'],
    correctIndex: 0,
  },
  {
    id: 38,
    type: 'mc',
    text: 'skirmish',
    options: ['fight', 'peace'],
    correctIndex: 0,
  },
  {
    id: 39,
    type: 'mc',
    text: 'generation',
    options: ['age group', 'individual'],
    correctIndex: 0,
  },
  {
    id: 40,
    type: 'mc',
    text: 'referral',
    options: ['recommendation', 'refusal'],
    correctIndex: 0,
  },

  // Part C - Spelling
  {
    id: 41,
    type: 'spelling',
    text: 'in______ive (means creative and original)',
    answer: 'inventive',
  },
  {
    id: 42,
    type: 'spelling',
    text: 'sus______ly (means in a doubtful way)',
    answer: 'suspiciously',
  },
  {
    id: 43,
    type: 'spelling',
    text: 'ne______iate (to discuss to reach agreement)',
    answer: 'negotiate',
  },
  {
    id: 44,
    type: 'spelling',
    text: 'en______ed (involved in something)',
    answer: 'engaged',
  },
  {
    id: 45,
    type: 'spelling',
    text: 're______al (directing someone elsewhere)',
    answer: 'referral',
  },
  {
    id: 46,
    type: 'spelling',
    text: 'gen______ion (people of the same age group)',
    answer: 'generation',
  },
  {
    id: 47,
    type: 'spelling',
    text: 'af______ative (showing approval)',
    answer: 'affirmative',
  },
  {
    id: 48,
    type: 'spelling',
    text: 'as______ion (strong statement believed true)',
    answer: 'assertion',
  },
  {
    id: 49,
    type: 'spelling',
    text: 'out______e (a result)',
    answer: 'outcome',
  },
  {
    id: 50,
    type: 'spelling',
    text: 'ev______ce (proof or facts)',
    answer: 'evidence',
  },
  {
    id: 51,
    type: 'spelling',
    text: 'ob______cle (something that blocks progress)',
    answer: 'obstacle',
  },
  {
    id: 52,
    type: 'spelling',
    text: 'con______er (to think carefully)',
    answer: 'consider',
  },
  {
    id: 53,
    type: 'spelling',
    text: 'em______ce (accept with enthusiasm)',
    answer: 'embrace',
  },
  {
    id: 54,
    type: 'spelling',
    text: 'cr______ple (to wrinkle or crush)',
    answer: 'crumple',
  },
  {
    id: 55,
    type: 'spelling',
    text: 'in______ection (short emotional word)',
    answer: 'interjection',
  },
  {
    id: 56,
    type: 'spelling',
    text: 'sn______ly (bad-tempered)',
    answer: 'snarly',
  },
  {
    id: 57,
    type: 'spelling',
    text: 'sk______ish (short argument)',
    answer: 'skirmish',
  },
  {
    id: 58,
    type: 'spelling',
    text: 'tr______e (temporary peace)',
    answer: 'truce',
  },
  {
    id: 59,
    type: 'spelling',
    text: 'im______ed (feeling admiration)',
    answer: 'impressed',
  },
  {
    id: 60,
    type: 'spelling',
    text: 'ba______in (to negotiate)',
    answer: 'bargain',
  },
];

const vocabTable: VocabRow[] = [
  { word: 'inventive', pos: 'adj.', synonym: 'innovative', antonym: 'dull' },
  { word: 'suspiciously', pos: 'adv.', synonym: 'doubtfully', antonym: 'trustingly' },
  { word: 'scooch', pos: 'v.', synonym: '', antonym: '' },
  { word: 'truce', pos: 'n.', synonym: 'agreement', antonym: '' },
  { word: 'impressed', pos: 'adj.', synonym: 'amazed', antonym: '' },
  { word: 'obstacle', pos: 'n.', synonym: 'barrier', antonym: '' },
  { word: 'consider', pos: 'v.', synonym: 'contemplate', antonym: '' },
  { word: 'embrace', pos: 'v.', synonym: 'welcome', antonym: 'reject' },
  { word: 'negotiate', pos: 'v.', synonym: 'bargain', antonym: '' },
  { word: 'engaged', pos: 'adj.', synonym: 'committed', antonym: 'inactive' },
  { word: 'referral', pos: 'n.', synonym: '', antonym: '' },
  { word: 'generation', pos: 'n.', synonym: 'age', antonym: '' },
  { word: 'affirmative', pos: 'adj.', synonym: 'assenting', antonym: 'dissenting' },
  { word: 'assertion', pos: 'n.', synonym: 'declaration', antonym: 'question' },
  { word: 'outcome', pos: 'n.', synonym: 'result', antonym: 'cause' },
  { word: 'evidence', pos: 'n.', synonym: 'proof', antonym: '' },
  { word: 'crumple', pos: 'v.', synonym: 'scrunch', antonym: 'smooth' },
  { word: 'interjection', pos: 'n.', synonym: 'exclamation', antonym: '' },
  { word: 'snarly', pos: 'adj.', synonym: 'bad-tempered', antonym: '' },
  { word: 'skirmish', pos: 'n.', synonym: 'fight', antonym: '' },
];

const focusWords = [
  'suspiciously',
  'negotiate',
  'referral',
  'affirmative',
  'assertion',
  'interjection',
  'generation',
  'obstacle',
  'crumple',
  'skirmish',
];

const miniPracticeA = [
  'The two countries tried to _________ to avoid war.',
  'The teacher looked at him __________ when he laughed.',
  'The broken bridge became a major __________.',
  '"Wow!" is an example of an __________.',
  'Their argument was only a small __________.',
];

const miniPracticeB = [
  'negotiate - noun form: __________',
  'assert - noun form: __________',
  'generate - noun form: __________',
  'refer - noun form: __________',
  'affirm - adjective form: __________',
];

const reviewAnswers = [
  '1 negotiate',
  '2 suspiciously',
  '3 obstacle',
  '4 interjection',
  '5 skirmish',
  '6 negotiation',
  '7 assertion',
  '8 generation',
  '9 referral',
  '10 affirmative',
];

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export default function VocabQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false })),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (currentQuestion.type === 'mc') {
      if (selectedOption === null) {
        alert('Please select an option.');
        return;
      }

      const isCorrect = selectedOption === currentQuestion.correctIndex;

      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { choice: selectedOption, text: '', isCorrect };
        return next;
      });

      setShowFeedback(true);
      return;
    }

    if (!spellingInput.trim()) {
      alert('Please enter your answer.');
      return;
    }

    const isCorrect = normalizeText(spellingInput) === normalizeText(currentQuestion.answer);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { choice: null, text: spellingInput, isCorrect };
      return next;
    });

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setSpellingInput('');
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSpellingInput('');
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const isAnswered = (q: Question, ans: Answer) => {
    if (q.type === 'mc') return ans.choice !== null;
    return ans.text.trim().length > 0;
  };

  const wrongQuestions = questions.filter((q, idx) => {
    const ans = answers[idx];
    return isAnswered(q, ans) && !ans.isCorrect;
  });

  const wrongCount = answers.filter((ans, idx) => isAnswered(questions[idx], ans) && !ans.isCorrect).length;

  const partLabel = () => {
    if (currentIndex < 20) return 'Part A · Multiple Choice';
    if (currentIndex < 40) return 'Part B · Synonym / Antonym';
    return 'Part C · Spelling';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <header
          style={{
            borderBottom: '1px solid #e5e7eb',
            marginBottom: 20,
            paddingBottom: 12,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 04 Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            60 questions · Part A 20 + Part B 20 + Part C 20 · Instant feedback and review after completion
          </p>
        </header>

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            <span>
              Question {currentIndex + 1} / {totalQuestions}
            </span>
            <span>
              Correct {correctCount} / Wrong {wrongCount}
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((currentIndex + (isFinished ? 1 : 0)) / totalQuestions) * 100}%`,
                maxWidth: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {!isFinished ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {partLabel()}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                {currentQuestion.id}. {currentQuestion.text}
              </h2>
            </div>

            {currentQuestion.type === 'mc' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectOption = showFeedback && index === currentQuestion.correctIndex;
                  const isWrongSelected = showFeedback && isSelected && !isCorrectOption;

                  let borderColor = '#e5e7eb';
                  let background = '#ffffff';

                  if (isCorrectOption) {
                    borderColor = '#16a34a';
                    background = '#dcfce7';
                  } else if (isWrongSelected) {
                    borderColor = '#ef4444';
                    background = '#fee2e2';
                  } else if (isSelected) {
                    borderColor = '#3b82f6';
                    background = '#eff6ff';
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (showFeedback) return;
                        setSelectedOption(index);
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: `2px solid ${borderColor}`,
                        background,
                        cursor: showFeedback ? 'default' : 'pointer',
                        fontSize: 14,
                      }}
                    >
                      <span style={{ fontWeight: 600, marginRight: 8 }}>{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={spellingInput}
                  onChange={(event) => {
                    if (showFeedback) return;
                    setSpellingInput(event.target.value);
                  }}
                  placeholder="Type your answer"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '2px solid #e5e7eb',
                    fontSize: 14,
                  }}
                />
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ minHeight: 24, fontSize: 14 }}>
                {showFeedback && (
                  <>
                    {currentQuestion.type === 'mc' ? (
                      selectedOption === currentQuestion.correctIndex ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          Incorrect. The answer is {String.fromCharCode(65 + currentQuestion.correctIndex)}.{' '}
                          {currentQuestion.options[currentQuestion.correctIndex]}.
                        </span>
                      )
                    ) : normalizeText(spellingInput) === normalizeText(currentQuestion.answer) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        Incorrect. The answer is {currentQuestion.answer}.
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!showFeedback ? (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: 'none',
                      background: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: 'none',
                      background: '#10b981',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {currentIndex === questions.length - 1 ? 'See Results' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Result Summary</h2>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              Out of {totalQuestions} questions: <strong>{correctCount} correct</strong>,{' '}
              <strong>{totalQuestions - correctCount} wrong</strong>
            </p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Score: <strong>{Math.round((correctCount / totalQuestions) * 100)}%</strong>
            </p>

            <button
              type="button"
              onClick={handleRestart}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                background: '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              Restart
            </button>

            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Wrong Answers Review</h3>
            {wrongQuestions.length === 0 ? (
              <p style={{ fontSize: 14 }}>No wrong answers. Perfect score!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrongQuestions.map((q) => {
                  const idx = questions.findIndex((qq) => qq.id === q.id);
                  const ans = answers[idx];

                  const selectedText =
                    q.type === 'mc'
                      ? ans.choice !== null
                        ? q.options[ans.choice]
                        : 'No choice'
                      : ans.text.trim() || 'No input';

                  const correctText = q.type === 'mc' ? q.options[q.correctIndex] : q.answer;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Question {q.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{q.text}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        Your answer: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        Correct answer: <strong>{correctText}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Vocabulary Summary Table</h3>
            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  minWidth: 560,
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Word</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Part of Speech</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Synonym</th>
                    <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Antonym</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabTable.map((row) => (
                    <tr key={row.word}>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.word}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.pos}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.synonym}</td>
                      <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{row.antonym}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Difficult Words Intensive Review</h3>

            <div style={{ fontSize: 14, marginBottom: 10 }}>
              <strong>Focus Words</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {focusWords.map((word) => (
                <span
                  key={word}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Mini Practice A. Fill in the blank</strong>
            </div>
            <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
              {miniPracticeA.map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ol>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Mini Practice B. Word Form Challenge</strong>
            </div>
            <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }} start={6}>
              {miniPracticeB.map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ol>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Answer</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {reviewAnswers.map((line) => (
                <span
                  key={line}
                  style={{
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontSize: 13,
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
