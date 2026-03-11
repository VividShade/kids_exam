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
    text: 'What does the word cranky mean?',
    options: ['very happy', 'easily annoyed or angry', 'very hungry', 'very quiet'],
    correctIndex: 1,
  },
  {
    id: 2,
    type: 'mc',
    text: 'A representative is someone who:',
    options: ['acts or speaks for others', 'cooks food for others', 'teaches a class', 'writes books'],
    correctIndex: 0,
  },
  {
    id: 3,
    type: 'mc',
    text: 'If you feel frustrated, you are:',
    options: ['very excited', 'very tired', 'upset because you cannot do something', 'ready to sleep'],
    correctIndex: 2,
  },
  {
    id: 4,
    type: 'mc',
    text: 'What is a spell?',
    options: ['a type of food', 'magic words that create magic', 'a book about history', 'a kind of animal'],
    correctIndex: 1,
  },
  {
    id: 5,
    type: 'mc',
    text: 'A promise means:',
    options: [
      'telling someone you will definitely do something',
      'asking someone a question',
      'giving someone money',
      'forgetting something',
    ],
    correctIndex: 0,
  },
  {
    id: 6,
    type: 'mc',
    text: 'If your parents give you a lecture, they are:',
    options: [
      'giving you candy',
      'telling a serious speech to change your behavior',
      'playing a game with you',
      'buying you a toy',
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    type: 'mc',
    text: 'If you refuse something, you:',
    options: ['say yes', 'say you are not willing to do it', 'finish it quickly', 'forget it'],
    correctIndex: 1,
  },
  {
    id: 8,
    type: 'mc',
    text: 'A selfish person:',
    options: ['thinks only about themselves', 'helps everyone', 'shares everything', 'likes animals'],
    correctIndex: 0,
  },
  {
    id: 9,
    type: 'mc',
    text: 'If mice scurry, they:',
    options: ['sleep quietly', 'move quickly with short steps', 'fly in the sky', 'swim in water'],
    correctIndex: 1,
  },
  {
    id: 10,
    type: 'mc',
    text: 'If you are famished, you are:',
    options: ['very hungry', 'very sleepy', 'very excited', 'very cold'],
    correctIndex: 0,
  },

  // Part B - Short Answer
  {
    id: 11,
    type: 'short',
    text: 'A person chosen to act or speak for others.',
    answer: 'representative',
  },
  {
    id: 12,
    type: 'short',
    text: 'Very upset because you cannot do something.',
    answer: 'frustrated',
  },
  {
    id: 13,
    type: 'short',
    text: 'Magic done by saying secret words.',
    answer: 'spell',
  },
  {
    id: 14,
    type: 'short',
    text: 'The act of telling someone you will definitely do something.',
    answer: 'promise',
  },
  {
    id: 15,
    type: 'short',
    text: 'To say that you are not willing to do something.',
    answer: 'refuse',
  },
  {
    id: 16,
    type: 'short',
    text: 'Moving quickly with short steps.',
    answer: 'scurry',
  },
  {
    id: 17,
    type: 'short',
    text: 'Very hungry.',
    answer: 'famished',
  },
  {
    id: 18,
    type: 'short',
    text: 'Easily annoyed or angry.',
    answer: 'cranky',
  },
  {
    id: 19,
    type: 'short',
    text: 'Only thinking about yourself and not other people.',
    answer: 'selfish',
  },
  {
    id: 20,
    type: 'short',
    text: 'An angry or serious speech to change someone\'s behavior.',
    answer: 'lecture',
  },
];

const answerKey: KeyItem[] = [
  { id: 1, answer: 'B', explanation: 'Cranky means easily annoyed or angry.' },
  { id: 2, answer: 'A', explanation: 'A representative speaks or acts for others.' },
  { id: 3, answer: 'C', explanation: 'Frustrated means upset because you cannot do something.' },
  { id: 4, answer: 'B', explanation: 'A spell is magic performed by saying special words.' },
  { id: 5, answer: 'A', explanation: 'A promise means telling someone you will definitely do something.' },
  { id: 6, answer: 'B', explanation: 'A lecture is a serious speech to correct behavior.' },
  { id: 7, answer: 'B', explanation: 'Refuse means not willing to do it.' },
  { id: 8, answer: 'A', explanation: 'Selfish means thinking only about yourself.' },
  { id: 9, answer: 'B', explanation: 'Scurry means moving quickly with short steps.' },
  { id: 10, answer: 'A', explanation: 'Famished means very hungry.' },
  { id: 11, answer: 'representative', explanation: 'Someone chosen to act or speak for others.' },
  { id: 12, answer: 'frustrated', explanation: 'Feeling upset because you cannot do something.' },
  { id: 13, answer: 'spell', explanation: 'Magic created by secret words.' },
  { id: 14, answer: 'promise', explanation: 'Telling someone you will definitely do something.' },
  { id: 15, answer: 'refuse', explanation: 'Saying you are not willing to do something.' },
  { id: 16, answer: 'scurry', explanation: 'Moving quickly with short steps.' },
  { id: 17, answer: 'famished', explanation: 'Very hungry.' },
  { id: 18, answer: 'cranky', explanation: 'Easily annoyed or angry.' },
  { id: 19, answer: 'selfish', explanation: 'Thinking only about yourself.' },
  { id: 20, answer: 'lecture', explanation: 'A serious speech meant to change behavior.' },
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

export default function VocabularyTest() {
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
      if (selectedOption === null) {
        alert('Please choose an option.');
        return;
      }

      const isCorrectAnswer = selectedOption === currentQuestion.correctIndex;
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { choice: selectedOption, text: '', isCorrect: isCorrectAnswer };
        return next;
      });
      setShowFeedback(true);
      return;
    }

    if (!shortAnswer.trim()) {
      alert('Please type your answer.');
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
  const isAnswered: QuestionChecker = (q, ans) =>
    q.type === 'mc' ? ans.choice !== null : ans.text.trim().length > 0;

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
    question.type === 'mc' ? String.fromCharCode(65 + question.correctIndex) : answerKey.find((k) => k.id === question.id)?.answer || '';

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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Vocabulary Test</h1>
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
