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
  // Part 1. Word Meaning
  {
    id: 1,
    type: 'mc',
    text: 'A person who takes action to solve a social or environmental problem is a ______.',
    options: ['marine', 'changemaker', 'scrawl', 'tumult'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'Something that you plan or want to do is your ______.',
    options: ['mission', 'disagreement', 'intention', 'conversion'],
    correctIndex: 2,
  },
  {
    id: 3,
    type: 'mc',
    text: 'Animals or plants that live in the sea are called ______ life.',
    options: ['marine', 'typical', 'unnecessary', 'brisk'],
    correctIndex: 0,
  },
  {
    id: 4,
    type: 'mc',
    text: 'Something that uses new ideas or methods is ______.',
    options: ['typical', 'innovative', 'deliberate', 'ordinary'],
    correctIndex: 1,
  },
  {
    id: 5,
    type: 'mc',
    text: 'An important task or duty someone believes they must do is a ______.',
    options: ['mission', 'disagreement', 'tumult', 'scrawl'],
    correctIndex: 0,
  },
  {
    id: 6,
    type: 'mc',
    text: 'To make something smaller or less is to ______ it.',
    options: ['cooperate', 'reduce', 'conserve', 'convert'],
    correctIndex: 1,
  },
  {
    id: 7,
    type: 'mc',
    text: 'Something that is normal for a group is ______.',
    options: ['typical', 'marine', 'dissenting', 'innovative'],
    correctIndex: 0,
  },
  {
    id: 8,
    type: 'mc',
    text: 'A soft material made from very thin artificial threads is ______.',
    options: ['marine', 'microfiber', 'conversion', 'tumult'],
    correctIndex: 1,
  },
  {
    id: 9,
    type: 'mc',
    text: 'The process of changing something from one form to another is ______.',
    options: ['conversion', 'disagreement', 'mission', 'intention'],
    correctIndex: 0,
  },
  {
    id: 10,
    type: 'mc',
    text: 'To write quickly and messily is to ______.',
    options: ['scrawl', 'chime', 'conserve', 'cooperate'],
    correctIndex: 0,
  },
  {
    id: 11,
    type: 'mc',
    text: 'Doing something on purpose means doing it ______.',
    options: ['briskly', 'deliberately', 'typically', 'softly'],
    correctIndex: 1,
  },
  {
    id: 12,
    type: 'mc',
    text: 'To protect something from waste or damage is to ______ it.',
    options: ['convert', 'conserve', 'reduce', 'scrawl'],
    correctIndex: 1,
  },
  {
    id: 13,
    type: 'mc',
    text: 'When people work together for a goal, they ______.',
    options: ['cooperate', 'dissent', 'scrawl', 'chime'],
    correctIndex: 0,
  },
  {
    id: 14,
    type: 'mc',
    text: 'When someone walks quickly and energetically, they walk ______.',
    options: ['slowly', 'briskly', 'deliberately', 'lazily'],
    correctIndex: 1,
  },
  {
    id: 15,
    type: 'mc',
    text: 'When a bell makes a clear ringing sound, it ______.',
    options: ['chimes', 'scrawls', 'converts', 'cooperates'],
    correctIndex: 0,
  },
  {
    id: 16,
    type: 'mc',
    text: 'Loud noise and excitement in a crowd is called ______.',
    options: ['intention', 'tumult', 'mission', 'conversion'],
    correctIndex: 1,
  },
  {
    id: 17,
    type: 'mc',
    text: 'Showing a strong different opinion is ______.',
    options: ['dissenting', 'typical', 'marine', 'brisk'],
    correctIndex: 0,
  },
  {
    id: 18,
    type: 'mc',
    text: 'Something that is not needed is ______.',
    options: ['unnecessary', 'typical', 'innovative', 'marine'],
    correctIndex: 0,
  },
  {
    id: 19,
    type: 'mc',
    text: 'An argument between people is a ______.',
    options: ['disagreement', 'mission', 'conversion', 'scrawl'],
    correctIndex: 0,
  },
  {
    id: 20,
    type: 'mc',
    text: 'A message that asks people to take action is a ______.',
    options: ['call to action', 'tumult', 'conversion', 'disagreement'],
    correctIndex: 0,
  },

  // Part 2. Synonym / antonym
  {
    id: 21,
    type: 'mc',
    text: 'Which word is closest in meaning to changemaker?',
    options: ['reformer', 'marine', 'towel', 'bell'],
    correctIndex: 0,
  },
  {
    id: 22,
    type: 'mc',
    text: 'Which word is closest in meaning to intention?',
    options: ['aim', 'noise', 'plan', 'water'],
    correctIndex: 0,
  },
  {
    id: 23,
    type: 'mc',
    text: 'Which word is closest in meaning to marine?',
    options: ['aquatic', 'noisy', 'land', 'quiet'],
    correctIndex: 0,
  },
  {
    id: 24,
    type: 'mc',
    text: 'Which word is closest in meaning to innovative?',
    options: ['ingenious', 'old', 'typical', 'slow'],
    correctIndex: 0,
  },
  {
    id: 25,
    type: 'mc',
    text: 'Which word is closest in meaning to mission?',
    options: ['objective', 'bell', 'sound', 'cloth'],
    correctIndex: 0,
  },
  {
    id: 26,
    type: 'mc',
    text: 'Which word is closest in meaning to reduce?',
    options: ['decrease', 'increase', 'grow', 'expand'],
    correctIndex: 0,
  },
  {
    id: 27,
    type: 'mc',
    text: 'Which word is closest in meaning to typical?',
    options: ['ordinary', 'strange', 'noisy', 'marine'],
    correctIndex: 0,
  },
  {
    id: 28,
    type: 'mc',
    text: 'Which word is the opposite of increase?',
    options: ['conserve', 'reduce', 'convert', 'cooperate'],
    correctIndex: 1,
  },
  {
    id: 29,
    type: 'mc',
    text: 'Which word is closest in meaning to scrawl?',
    options: ['scribble', 'print', 'speak', 'ring'],
    correctIndex: 0,
  },
  {
    id: 30,
    type: 'mc',
    text: 'Which word is closest in meaning to deliberately?',
    options: ['intentionally', 'quickly', 'softly', 'slowly'],
    correctIndex: 0,
  },
  {
    id: 31,
    type: 'mc',
    text: 'Which word is closest in meaning to conserve?',
    options: ['preserve', 'waste', 'break', 'lose'],
    correctIndex: 0,
  },
  {
    id: 32,
    type: 'mc',
    text: 'Which word is closest in meaning to cooperate?',
    options: ['collaborate', 'argue', 'shout', 'run'],
    correctIndex: 0,
  },
  {
    id: 33,
    type: 'mc',
    text: 'Which word is closest in meaning to briskly?',
    options: ['swiftly', 'slowly', 'quietly', 'softly'],
    correctIndex: 0,
  },
  {
    id: 34,
    type: 'mc',
    text: 'Which word is closest in meaning to tumult?',
    options: ['ruckus', 'silence', 'whisper', 'calm'],
    correctIndex: 0,
  },
  {
    id: 35,
    type: 'mc',
    text: 'Which word is closest in meaning to dissenting?',
    options: ['disagreeing', 'agreeing', 'shouting', 'listening'],
    correctIndex: 0,
  },
  {
    id: 36,
    type: 'mc',
    text: 'Which word is the opposite of dissenting?',
    options: ['agreeing', 'arguing', 'shouting', 'rushing'],
    correctIndex: 0,
  },
  {
    id: 37,
    type: 'mc',
    text: 'Which word is closest in meaning to unnecessary?',
    options: ['needless', 'helpful', 'needed', 'important'],
    correctIndex: 0,
  },
  {
    id: 38,
    type: 'mc',
    text: 'Which word is the opposite of unnecessary?',
    options: ['needed', 'waste', 'reduce', 'argue'],
    correctIndex: 0,
  },
  {
    id: 39,
    type: 'mc',
    text: 'Which word is closest in meaning to disagreement?',
    options: ['dispute', 'mission', 'idea', 'plan'],
    correctIndex: 0,
  },
  {
    id: 40,
    type: 'mc',
    text: 'Which word is closest in meaning to call to action?',
    options: ['appeal', 'noise', 'argument', 'speech'],
    correctIndex: 0,
  },

  // Part 3. Spelling
  { id: 41, type: 'spelling', text: 'A person who tries to improve society: c__________', answer: 'changemaker' },
  { id: 42, type: 'spelling', text: 'Something you plan to do: i__________', answer: 'intention' },
  { id: 43, type: 'spelling', text: 'Related to the sea: m__________', answer: 'marine' },
  { id: 44, type: 'spelling', text: 'Using new ideas: i__________', answer: 'innovative' },
  { id: 45, type: 'spelling', text: 'An important duty or job: m__________', answer: 'mission' },
  { id: 46, type: 'spelling', text: 'To make something smaller: r__________', answer: 'reduce' },
  { id: 47, type: 'spelling', text: 'Normal for a group: t__________', answer: 'typical' },
  { id: 48, type: 'spelling', text: 'A soft artificial fiber cloth: m__________', answer: 'microfiber' },
  { id: 49, type: 'spelling', text: 'Changing something into another form: c__________', answer: 'conversion' },
  { id: 50, type: 'spelling', text: 'To write quickly and messily: s__________', answer: 'scrawl' },
  { id: 51, type: 'spelling', text: 'On purpose: d__________', answer: 'deliberately' },
  { id: 52, type: 'spelling', text: 'To protect resources: c__________', answer: 'conserve' },
  { id: 53, type: 'spelling', text: 'To work together: c__________', answer: 'cooperate' },
  { id: 54, type: 'spelling', text: 'In a quick energetic way: b__________', answer: 'briskly' },
  { id: 55, type: 'spelling', text: 'A bell making a ringing sound: c__________', answer: 'chime' },
  { id: 56, type: 'spelling', text: 'Loud excitement or noise: t__________', answer: 'tumult' },
  { id: 57, type: 'spelling', text: 'Showing disagreement: d__________', answer: 'dissenting' },
  { id: 58, type: 'spelling', text: 'Not needed: u__________', answer: 'unnecessary' },
  { id: 59, type: 'spelling', text: 'An argument between people: d__________', answer: 'disagreement' },
  {
    id: 60,
    type: 'spelling',
    text: 'A message asking people to act: c__________',
    answer: 'call to action',
  },
];

const vocabTable: VocabRow[] = [
  { word: 'changemaker', pos: 'noun', synonym: 'reformer', antonym: '' },
  { word: 'intention', pos: 'noun', synonym: 'aim', antonym: '' },
  { word: 'marine', pos: 'adj', synonym: 'aquatic', antonym: 'terrestrial' },
  { word: 'innovative', pos: 'adj', synonym: 'ingenious', antonym: 'old-fashioned' },
  { word: 'mission', pos: 'noun', synonym: 'objective', antonym: '' },
  { word: 'reduce', pos: 'verb', synonym: 'decrease', antonym: 'increase' },
  { word: 'typical', pos: 'adj', synonym: 'ordinary', antonym: 'extraordinary' },
  { word: 'microfiber', pos: 'noun', synonym: '', antonym: '' },
  { word: 'conversion', pos: 'noun', synonym: '', antonym: '' },
  { word: 'scrawl', pos: 'verb', synonym: 'scribble', antonym: '' },
  { word: 'deliberately', pos: 'adv', synonym: 'intentionally', antonym: '' },
  { word: 'conserve', pos: 'verb', synonym: 'preserve', antonym: 'waste' },
  { word: 'cooperate', pos: 'verb', synonym: 'collaborate', antonym: '' },
  { word: 'briskly', pos: 'adv', synonym: 'swiftly', antonym: 'slowly' },
  { word: 'chime', pos: 'verb', synonym: '', antonym: '' },
  { word: 'tumult', pos: 'noun', synonym: 'ruckus', antonym: '' },
  { word: 'dissenting', pos: 'adj', synonym: 'disagreeing', antonym: 'assenting' },
  { word: 'unnecessary', pos: 'adj', synonym: 'needless', antonym: 'necessary' },
  { word: 'disagreement', pos: 'noun', synonym: 'dispute', antonym: 'agreement' },
  { word: 'call to action', pos: 'phrase', synonym: 'appeal', antonym: '' },
];

const focusWords = [
  'changemaker',
  'intention',
  'innovative',
  'microfiber',
  'conversion',
  'scrawl',
  'deliberately',
  'conserve',
  'cooperate',
  'briskly',
  'dissenting',
  'unnecessary',
  'disagreement',
  'tumult',
  'typical',
];

const miniPracticeA = [
  'We must ______ electricity by turning off the lights.',
  'The class had a loud ______ after the announcement.',
  'She walked ______ to catch the bus.',
  'The students decided to ______ on the group project.',
  'His ______ was to become a scientist.',
];

const miniSpellingChallenge = ['dissagreemant', 'unneccessary', 'delibrately', 'inovative', 'microfibre'];

const reviewAnswers = ['1 conserve', '2 scrawl', '3 work together', '4 saving resources', '5 something you plan to do'];

const speedReviewPrompts = [
  { key: 'A', word: 'conserve', meaning: 'saving resources' },
  { key: 'B', word: 'cooperate', meaning: 'working together' },
  { key: 'C', word: 'tumult', meaning: 'loud noisy excitement' },
  { key: 'D', word: 'intention', meaning: 'something you plan to do' },
  { key: 'E', word: 'scrawl', meaning: 'messy quick writing' },
];

const answerKey = {
  mcAnswers: [
    'B',
    'C',
    'A',
    'B',
    'A',
    'B',
    'A',
    'B',
    'A',
    'A',
    'B',
    'B',
    'A',
    'B',
    'A',
    'B',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'B',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
    'A',
  ],
  spellingAnswers: [
    'changemaker',
    'intention',
    'marine',
    'innovative',
    'mission',
    'reduce',
    'typical',
    'microfiber',
    'conversion',
    'scrawl',
    'deliberately',
    'conserve',
    'cooperate',
    'briskly',
    'chime',
    'tumult',
    'dissenting',
    'unnecessary',
    'disagreement',
    'call to action',
  ],
};

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export default function VocabQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false }))
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (currentQuestion.type === 'mc') {
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
        <header style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 20, paddingBottom: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Week 06 Vocabulary Test</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            60 questions · Part 1 20 + Part 2 20 + Part 3 20 · Instant feedback and review after completion
          </p>
        </header>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
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
                        const isCorrect = index === currentQuestion.correctIndex;
                        setSelectedOption(index);
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[currentIndex] = { choice: index, text: '', isCorrect };
                          return next;
                        });
                        setShowFeedback(true);
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
                {!showFeedback && currentQuestion.type !== 'mc' ? (
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
                ) : null}
                {showFeedback ? (
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
                ) : null}
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
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

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Spelling Focus List</strong>
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
              <strong>Mini Practice 1. Fill in the blank</strong>
            </div>
            <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
              {miniPracticeA.map((item) => (
                <li key={item} style={{ marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ol>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Mini Practice 2. Spelling challenge</strong>
            </div>
            <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
              {miniSpellingChallenge.map((item, idx) => (
                <li key={item} style={{ marginBottom: 4 }}>
                  {`${idx + 1}. ${item}`}
                </li>
              ))}
            </ol>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Mini Practice 3. Speed review</strong>
            </div>
            <ol style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20, fontSize: 14 }}>
              {speedReviewPrompts.map((item) => (
                <li key={item.key} style={{ marginBottom: 4 }}>
                  <strong>{item.key}</strong> {item.word}
                </li>
              ))}
            </ol>
            <ul style={{ marginTop: 0, marginBottom: 16, paddingLeft: 20, fontSize: 13 }}>
              <li>1. loud noisy excitement</li>
              <li>2. messy quick writing</li>
              <li>3. working together</li>
              <li>4. saving resources</li>
              <li>5. something you plan to do</li>
            </ul>

            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>Answer Key</strong>
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <strong>Part 1 (1–20):</strong> {answerKey.mcAnswers.slice(0, 20).join(' ')}
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <strong>Part 2 (21–40):</strong> {answerKey.mcAnswers.slice(20, 40).join(' ')}
            </div>
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: 13 }}>Part 3 (41–60):</strong>
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                {answerKey.spellingAnswers.map((item, idx) => (
                  <div key={item + idx} style={{ background: '#f0fdf4', padding: 6, borderRadius: 8 }}>
                    {41 + idx}. {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Wrong answer review</strong>
            </div>
            <p style={{ fontSize: 13 }}>{reviewAnswers.join(' | ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
