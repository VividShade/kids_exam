'use client';

import { useState } from 'react';

type McQuestion = {
  id: number;
  type: 'mc';
  text: string;
  options: string[];
  correctIndex: number;
};

type ShortAnswerQuestion = {
  id: number;
  type: 'short';
  text: string;
  answer: string;
};

type Question = McQuestion | ShortAnswerQuestion;

type Answer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type QuestionChecker = (q: Question, a: Answer) => boolean;

type KeyItem = {
  id: number;
  answer: string;
  explanation: string;
};

const questions: Question[] = [
  // Part A - Multiple Choice
  {
    id: 1,
    type: 'mc',
    text: 'She ______ a book right now.',
    options: ['reads', 'is reading', 'read'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'We ______ soccer in the park.',
    options: ['are playing', 'play', 'playing'],
    correctIndex: 0,
  },
  {
    id: 3,
    type: 'mc',
    text: 'I ______ dinner at the moment.',
    options: ['cook', 'am cooking', 'cooking'],
    correctIndex: 1,
  },
  {
    id: 4,
    type: 'mc',
    text: 'The birds ______ in the sky.',
    options: ['fly', 'flying', 'are flying'],
    correctIndex: 2,
  },
  {
    id: 5,
    type: 'mc',
    text: 'He ______ his homework now.',
    options: ['is doing', 'do', 'doing'],
    correctIndex: 0,
  },
  {
    id: 6,
    type: 'mc',
    text: 'The students ______ to the teacher.',
    options: ['listens', 'are listening', 'listening'],
    correctIndex: 1,
  },
  {
    id: 7,
    type: 'mc',
    text: 'My father ______ TV in the living room.',
    options: ['is watching', 'watch', 'watching'],
    correctIndex: 0,
  },
  {
    id: 8,
    type: 'mc',
    text: 'They ______ a new house in the city.',
    options: ['build', 'are building', 'building'],
    correctIndex: 1,
  },
  {
    id: 9,
    type: 'mc',
    text: 'The baby ______ now.',
    options: ['cry', 'is crying', 'crying'],
    correctIndex: 1,
  },
  {
    id: 10,
    type: 'mc',
    text: 'I ______ to music.',
    options: ['am listening', 'listen', 'listening'],
    correctIndex: 0,
  },

  // Part B - Fill in the blank
  {
    id: 11,
    type: 'short',
    text: 'She ______ (dance) to the music.',
    answer: 'is dancing',
  },
  {
    id: 12,
    type: 'short',
    text: 'The boys ______ (run) in the playground.',
    answer: 'are running',
  },
  {
    id: 13,
    type: 'short',
    text: 'I ______ (write) a letter to my friend.',
    answer: 'am writing',
  },
  {
    id: 14,
    type: 'short',
    text: 'They ______ (eat) lunch now.',
    answer: 'are eating',
  },
  {
    id: 15,
    type: 'short',
    text: 'The dog ______ (chase) the ball.',
    answer: 'is chasing',
  },
  {
    id: 16,
    type: 'short',
    text: 'We ______ (study) English today.',
    answer: 'are studying',
  },
  {
    id: 17,
    type: 'short',
    text: 'My mother ______ (cook) dinner in the kitchen.',
    answer: 'is cooking',
  },
  {
    id: 18,
    type: 'short',
    text: 'The children ______ (play) with their toys.',
    answer: 'are playing',
  },
  {
    id: 19,
    type: 'short',
    text: 'He ______ (read) a comic book.',
    answer: 'is reading',
  },
  {
    id: 20,
    type: 'short',
    text: 'The teacher ______ (talk) to the students.',
    answer: 'is talking',
  },
];

const answerKey: KeyItem[] = [
  { id: 1, answer: 'B', explanation: 'Use be + verb-ing. She is reading.' },
  { id: 2, answer: 'A', explanation: 'Use am / is / are + verb-ing. "We are playing."' },
  { id: 3, answer: 'B', explanation: 'I -> am, so I am cooking.' },
  { id: 4, answer: 'C', explanation: 'The birds are flying in the sky.' },
  { id: 5, answer: 'A', explanation: 'He -> is. Correct form: is doing.' },
  { id: 6, answer: 'B', explanation: 'Students are the subject, so are listening.' },
  { id: 7, answer: 'A', explanation: 'My father -> is watching TV.' },
  { id: 8, answer: 'B', explanation: 'They -> are building.' },
  { id: 9, answer: 'B', explanation: 'The baby is crying now.' },
  { id: 10, answer: 'A', explanation: 'I am listening to music.' },
  { id: 11, answer: 'is dancing', explanation: 'She is dancing to the music.' },
  { id: 12, answer: 'are running', explanation: 'The boys are running in the playground.' },
  { id: 13, answer: 'am writing', explanation: 'I am writing a letter to my friend.' },
  { id: 14, answer: 'are eating', explanation: 'They are eating lunch now.' },
  { id: 15, answer: 'is chasing', explanation: 'The dog is chasing the ball.' },
  { id: 16, answer: 'are studying', explanation: 'We are studying English today.' },
  { id: 17, answer: 'is cooking', explanation: 'My mother is cooking dinner in the kitchen.' },
  { id: 18, answer: 'are playing', explanation: 'The children are playing with their toys.' },
  { id: 19, answer: 'is reading', explanation: 'He is reading a comic book.' },
  { id: 20, answer: 'is talking', explanation: 'The teacher is talking to the students.' },
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function isCorrect(question: Question, answer: Answer): boolean {
  if (question.type === 'mc') {
    return answer.choice === question.correctIndex;
  }

  return normalize(answer.text) === normalize(question.answer);
}

export default function PresentContinuousQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false })),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (currentQuestion.type === 'mc') {
      return;
    }

    const isCorrectAnswer = normalize(shortAnswer) === normalize(currentQuestion.answer);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { choice: null, text: shortAnswer, isCorrect: isCorrectAnswer };
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
    setShortAnswer('');
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShortAnswer('');
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const isAnswered: QuestionChecker = (q, ans) => (q.type === 'mc' ? ans.choice !== null : ans.text.trim().length > 0);

  const correctCount = answers.filter((ans, index) => isCorrect(questions[index], ans)).length;
  const completedCount = answers.filter((ans, index) => isAnswered(questions[index], ans)).length;
  const wrongCount = answers.filter(
    (ans, index) => isAnswered(questions[index], ans) && !isCorrect(questions[index], ans),
  ).length;

  const partLabel = () => {
    if (currentIndex < 10) return 'Part A · Multiple Choice';
    return 'Part B · Short Answer';
  };

  const wrongQuestions = questions
    .map((q, idx) => ({ question: q, index: idx, answer: answers[idx] }))
    .filter(({ question, answer }) => answer.isCorrect === false && (answer.choice !== null || answer.text.trim().length > 0));

  const getCorrectLabel = (question: Question): string =>
    question.type === 'mc'
      ? String.fromCharCode(65 + question.correctIndex)
      : answerKey.find((k) => k.id === question.id)?.answer || '';

  const getSelectedLabel = (question: Question, answer: Answer): string => {
    if (question.type === 'mc') {
      if (answer.choice === null) return 'No answer';
      return String.fromCharCode(65 + answer.choice) + '. ' + question.options[answer.choice];
    }

    if (!answer.text.trim()) return 'No answer';
    return answer.text;
  };

  const currentCorrectAnswerText =
    currentQuestion.type === 'mc'
      ? `${String.fromCharCode(65 + currentQuestion.correctIndex)}. ${currentQuestion.options[currentQuestion.correctIndex]}`
      : answerKey.find((item) => item.id === currentQuestion.id)?.answer ?? '';

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
          maxWidth: 820,
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Present Continuous Quiz</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Total 20 Questions · Part A 10 + Part B 10 · One by one review mode</p>
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
                      const isCorrectAnswer = index === currentQuestion.correctIndex;
                      setSelectedOption(index);
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[currentIndex] = {
                          choice: index,
                          text: '',
                          isCorrect: isCorrectAnswer,
                        };
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
                  value={shortAnswer}
                  onChange={(event) => {
                    if (showFeedback) return;
                    setShortAnswer(event.target.value);
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
                {showFeedback ? (
                  <>
                    {currentQuestion.type === 'mc' ? (
                      selectedOption === currentQuestion.correctIndex ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          Incorrect. The answer is {currentCorrectAnswerText}.
                        </span>
                      )
                    ) : isCorrect(questions[currentIndex], answers[currentIndex]) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        Incorrect. The answer is {currentCorrectAnswerText}.
                      </span>
                    )}
                  </>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
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
                ) : currentQuestion.type !== 'mc' ? (
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
                {wrongQuestions.map(({ question, answer }) => {
                  const key = answerKey.find((k) => k.id === question.id);
                  const correctText = getCorrectLabel(question);
                  const selectedText = getSelectedLabel(question, answer);

                  return (
                    <div
                      key={question.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Question {question.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{question.text}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        Your answer: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        Correct answer: <strong>{correctText}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: '#475569' }}>{key?.explanation}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
