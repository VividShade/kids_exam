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
  // Part 1: Word Meaning
  {
    id: 1,
    type: 'mc',
    text: 'To strongly hope to achieve something.',
    options: ['donate', 'aspire', 'advocate', 'deliberate'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'To create space for something.',
    options: ['make room', 'incident', 'annual', 'orderly'],
    correctIndex: 0,
  },
  {
    id: 3,
    type: 'mc',
    text: 'Feeling worried or anxious about something.',
    options: ['disciplined', 'concerned', 'inventive', 'preliminary'],
    correctIndex: 1,
  },
  {
    id: 4,
    type: 'mc',
    text: 'To give money or goods to help others.',
    options: ['donate', 'advocate', 'aspire', 'deliberate'],
    correctIndex: 0,
  },
  {
    id: 5,
    type: 'mc',
    text: 'Happening once every year.',
    options: ['annual', 'preliminary', 'orderly', 'deliberate'],
    correctIndex: 0,
  },
  {
    id: 6,
    type: 'mc',
    text: 'An organization that helps people in need.',
    options: ['charity', 'incident', 'non-profit', 'advocate'],
    correctIndex: 0,
  },
  {
    id: 7,
    type: 'mc',
    text: 'Not intended to make a profit.',
    options: ['non-profit', 'inventive', 'critical thinking', 'orderly'],
    correctIndex: 0,
  },
  {
    id: 8,
    type: 'mc',
    text: 'To compare something to understand it better.',
    options: ['advocate', 'deliberate', 'put into perspective', 'incident'],
    correctIndex: 2,
  },
  {
    id: 9,
    type: 'mc',
    text: 'Not controlled by another country or authority.',
    options: ['preliminary', 'independent', 'inventive', 'critical'],
    correctIndex: 1,
  },
  {
    id: 10,
    type: 'mc',
    text: 'Well organized and neat.',
    options: ['orderly', 'immature', 'concerned', 'deliberate'],
    correctIndex: 0,
  },
  {
    id: 11,
    type: 'mc',
    text: 'Behaving like a much younger person.',
    options: ['disciplined', 'inventive', 'immature', 'annual'],
    correctIndex: 2,
  },
  {
    id: 12,
    type: 'mc',
    text: 'Having strong self-control.',
    options: ['disciplined', 'preliminary', 'concerned', 'incident'],
    correctIndex: 0,
  },
  {
    id: 13,
    type: 'mc',
    text: 'An unusual or unpleasant event.',
    options: ['charity', 'incident', 'annual', 'advocate'],
    correctIndex: 1,
  },
  {
    id: 14,
    type: 'mc',
    text: 'Coming before the main event.',
    options: ['preliminary', 'inventive', 'deliberate', 'independent'],
    correctIndex: 0,
  },
  {
    id: 15,
    type: 'mc',
    text: 'Very good at creating new ideas.',
    options: ['inventive', 'disciplined', 'orderly', 'concerned'],
    correctIndex: 0,
  },
  {
    id: 16,
    type: 'mc',
    text: 'Done on purpose.',
    options: ['preliminary', 'deliberately', 'orderly', 'inventive'],
    correctIndex: 1,
  },
  {
    id: 17,
    type: 'mc',
    text: 'Work done to help others without pay.',
    options: ['community service', 'charity', 'incident', 'annual'],
    correctIndex: 0,
  },
  {
    id: 18,
    type: 'mc',
    text: 'Extremely useful.',
    options: ['deliberate', 'invaluable', 'immature', 'incident'],
    correctIndex: 1,
  },
  {
    id: 19,
    type: 'mc',
    text: 'To publicly support an idea.',
    options: ['advocate', 'deliberate', 'aspire', 'donate'],
    correctIndex: 0,
  },
  {
    id: 20,
    type: 'mc',
    text: 'Thinking carefully about a problem.',
    options: ['critical thinking', 'inventive', 'preliminary', 'annual'],
    correctIndex: 0,
  },

  // Part 2: Synonym / Antonym
  {
    id: 21,
    type: 'mc',
    text: 'Synonym of aspire',
    options: ['desire', 'ignore', 'destroy', 'cancel'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'Synonym of make room',
    options: ['accommodate', 'prevent', 'ignore', 'cancel'],
    correctIndex: 0,
  },
  {
    id: 23,
    type: 'mc',
    text: 'Antonym of concerned',
    options: ['distressed', 'calm', 'worried', 'nervous'],
    correctIndex: 1,
  },
  {
    id: 24,
    type: 'mc',
    text: 'Synonym of donate',
    options: ['contribute', 'take', 'destroy', 'refuse'],
    correctIndex: 0,
  },
  {
    id: 25,
    type: 'mc',
    text: 'Synonym of annual',
    options: ['monthly', 'yearly', 'daily', 'weekly'],
    correctIndex: 1,
  },
  {
    id: 26,
    type: 'mc',
    text: 'Synonym of non-profit',
    options: ['profitable', 'charitable', 'expensive', 'careless'],
    correctIndex: 1,
  },
  {
    id: 27,
    type: 'mc',
    text: 'Antonym of non-profit',
    options: ['charitable', 'profitable', 'generous', 'helpful'],
    correctIndex: 1,
  },
  {
    id: 28,
    type: 'mc',
    text: 'Antonym of charity',
    options: ['kindness', 'giving', 'business', 'support'],
    correctIndex: 2,
  },
  {
    id: 29,
    type: 'mc',
    text: 'Synonym of independent',
    options: ['free', 'dependent', 'weak', 'controlled'],
    correctIndex: 0,
  },
  {
    id: 30,
    type: 'mc',
    text: 'Synonym of orderly',
    options: ['messy', 'neat', 'careless', 'chaotic'],
    correctIndex: 1,
  },
  {
    id: 31,
    type: 'mc',
    text: 'Antonym of orderly',
    options: ['organized', 'careful', 'disorderly', 'calm'],
    correctIndex: 2,
  },
  {
    id: 32,
    type: 'mc',
    text: 'Synonym of immature',
    options: ['childish', 'adult', 'careful', 'calm'],
    correctIndex: 0,
  },
  {
    id: 33,
    type: 'mc',
    text: 'Antonym of immature',
    options: ['silly', 'mature', 'childish', 'young'],
    correctIndex: 1,
  },
  {
    id: 34,
    type: 'mc',
    text: 'Synonym of disciplined',
    options: ['restrained', 'careless', 'weak', 'messy'],
    correctIndex: 0,
  },
  {
    id: 35,
    type: 'mc',
    text: 'Antonym of disciplined',
    options: ['organized', 'restrained', 'unrestrained', 'careful'],
    correctIndex: 2,
  },
  {
    id: 36,
    type: 'mc',
    text: 'Synonym of incident',
    options: ['event', 'silence', 'object', 'machine'],
    correctIndex: 0,
  },
  {
    id: 37,
    type: 'mc',
    text: 'Synonym of preliminary',
    options: ['final', 'introductory', 'complete', 'finished'],
    correctIndex: 1,
  },
  {
    id: 38,
    type: 'mc',
    text: 'Synonym of inventive',
    options: ['innovative', 'dull', 'boring', 'quiet'],
    correctIndex: 0,
  },
  {
    id: 39,
    type: 'mc',
    text: 'Synonym of deliberately',
    options: ['accidentally', 'intentionally', 'suddenly', 'quickly'],
    correctIndex: 1,
  },
  {
    id: 40,
    type: 'mc',
    text: 'Synonym of critical thinking',
    options: ['guessing', 'analysis', 'ignoring', 'copying'],
    correctIndex: 1,
  },

  // Part 3: Spelling
  { id: 41, type: 'spelling', text: 'aspier', answer: 'aspire' },
  { id: 42, type: 'spelling', text: 'concened', answer: 'concerned' },
  { id: 43, type: 'spelling', text: 'disiplined', answer: 'disciplined' },
  { id: 44, type: 'spelling', text: 'prelimanary', answer: 'preliminary' },
  { id: 45, type: 'spelling', text: 'delibrately', answer: 'deliberately' },
  { id: 46, type: 'spelling', text: 'inventve', answer: 'inventive' },
  { id: 47, type: 'spelling', text: 'invaluabe', answer: 'invaluable' },
  { id: 48, type: 'spelling', text: 'advocat', answer: 'advocate' },
  { id: 49, type: 'spelling', text: 'comunnity service', answer: 'community service' },
  { id: 50, type: 'spelling', text: 'crtical thinking', answer: 'critical thinking' },
  { id: 51, type: 'spelling', text: 'non profitt', answer: 'non-profit' },
  { id: 52, type: 'spelling', text: 'charaty', answer: 'charity' },
  { id: 53, type: 'spelling', text: 'independant', answer: 'independent' },
  { id: 54, type: 'spelling', text: 'immuture', answer: 'immature' },
  { id: 55, type: 'spelling', text: 'ordely', answer: 'orderly' },
  { id: 56, type: 'spelling', text: 'anual', answer: 'annual' },
  { id: 57, type: 'spelling', text: 'incdent', answer: 'incident' },
  { id: 58, type: 'spelling', text: 'acomodate', answer: 'accommodate' },
  { id: 59, type: 'spelling', text: 'desier', answer: 'desire' },
  { id: 60, type: 'spelling', text: 'contribut', answer: 'contribute' },
];

const vocabTable: VocabRow[] = [
  { word: 'aspire', pos: 'verb', synonym: 'desire', antonym: '' },
  { word: 'make room', pos: 'phrasal verb', synonym: 'accommodate', antonym: '' },
  { word: 'concerned', pos: 'adj', synonym: 'distressed', antonym: 'calm' },
  { word: 'donate', pos: 'verb', synonym: 'contribute', antonym: '' },
  { word: 'annual', pos: 'adj', synonym: 'yearly', antonym: '' },
  { word: 'non-profit', pos: 'adj', synonym: 'charitable', antonym: 'profitmaking' },
  { word: 'charity', pos: 'noun', synonym: '', antonym: 'business' },
  { word: 'put into perspective', pos: 'phrase', synonym: '', antonym: '' },
  { word: 'independent', pos: 'adj', synonym: 'autonomous', antonym: 'dependent' },
  { word: 'orderly', pos: 'adj', synonym: 'neat', antonym: 'disorderly' },
  { word: 'immature', pos: 'adj', synonym: 'childish', antonym: 'mature' },
  { word: 'disciplined', pos: 'adj', synonym: 'restrained', antonym: 'unrestrained' },
  { word: 'incident', pos: 'noun', synonym: 'episode', antonym: '' },
  { word: 'preliminary', pos: 'adj', synonym: 'introductory', antonym: 'final' },
  { word: 'inventive', pos: 'adj', synonym: 'innovative', antonym: 'dull' },
  { word: 'deliberately', pos: 'adv', synonym: 'intentionally', antonym: '' },
  { word: 'community service', pos: 'noun', synonym: 'volunteering', antonym: '' },
  { word: 'invaluable', pos: 'adj', synonym: 'beneficial', antonym: 'pointless' },
  { word: 'advocate', pos: 'verb', synonym: 'propose', antonym: 'condemn' },
  { word: 'critical thinking', pos: 'noun', synonym: 'analysis', antonym: '' },
];

const focusWords = [
  'accommodate',
  'deliberately',
  'preliminary',
  'disciplined',
  'independent',
  'community',
  'invaluable',
  'immature',
  'advocate',
  'inventive',
];

const mnemonicList = [
  'accommodate = ac + com + mod + ate',
  'deliberately = de + liber + ate + ly',
  'preliminary = pre + limin + ary',
  'disciplined = discipline + d',
  'independent = in + depend + ent',
];

const miniPracticeA: string[] = [
  '1. ________ means to work hard toward a goal without giving up.',
  '2. The project was put into perspective before the final decision.',
  '3. Every member of the club can do ________ service hours.',
  '4. The room looked neat and ________ before the event.',
  '5. A major ________ happened during the annual festival.',
];

const miniPracticeB: string[] = [
  '6. community service - this is a ________ work.',
  '7. independent - he is an ________ thinker.',
  '8. non-profit - a ________ organization is not for profit.',
  '9. annual - held every ________.',
  '10. deliberate - done ________ with care.',
];

const reviewAnswers = [
  '1. aspire',
  '2. concerned',
  '3. disciplined',
  '4. preliminary',
  '5. deliberately',
  '6. inventive',
  '7. invaluable',
  '8. advocate',
  '9. community service',
  '10. critical thinking',
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
  const completedCount = answers.filter((ans, idx) => isAnswered(questions[idx], ans)).length;
  const wrongCount = wrongQuestions.length;

  const partLabel = () => {
    if (currentIndex < 20) return 'Part 1 · Word Meaning';
    if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
    return 'Part 3 · Spelling';
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
          maxWidth: 840,
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 06 Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            60 questions · Part 1 20 + Part 2 20 + Part 3 20 · Instant feedback and review after completion
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
              Question {completedCount} / {totalQuestions}
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
                width: `${(completedCount / totalQuestions) * 100}%`,
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
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
              <strong>Quick Memory Method</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {mnemonicList.map((item) => (
                <div key={item} style={{ fontSize: 13, background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                  {item}
                </div>
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
            <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
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
