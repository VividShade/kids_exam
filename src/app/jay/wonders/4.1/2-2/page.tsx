'use client';

import { useState } from 'react';

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

type Answer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type KeyItem = {
  id: number;
  answer: string;
  explanation: string;
};

const questions: Question[] = [
  {
    id: 1,
    text: 'Where does Scene 1 take place?',
    options: ['In a castle', 'In a forest clearing near a well', 'In a village market', 'In a river'],
    correctIndex: 1,
  },
  {
    id: 2,
    text: 'What are the men searching for at the beginning of the story?',
    options: ['A silver sword', 'A golden arrow', 'A treasure chest', 'A magic ring'],
    correctIndex: 1,
  },
  {
    id: 3,
    text: 'Who owns the golden arrow?',
    options: ['Pepe', 'The Viceroy', 'Felipe', 'Ranita'],
    correctIndex: 2,
  },
  {
    id: 4,
    text: 'Where is Ranita sitting when Felipe finds her?',
    options: ['On a tree branch', 'On top of a well', 'Inside a cave', 'On a rock'],
    correctIndex: 1,
  },
  {
    id: 5,
    text: 'Why does Ranita say she is a frog?',
    options: ['She was born a frog', 'She likes frogs', 'She is under a spell', 'She is hiding from Felipe'],
    correctIndex: 2,
  },
  {
    id: 6,
    text: 'What does Ranita do with the golden arrow after Felipe asks for it?',
    options: ['She keeps it', 'She throws it away', 'She drops it back into the well', 'She gives it to Pepe'],
    correctIndex: 2,
  },
  {
    id: 7,
    text: 'What does Ranita ask Felipe to promise?',
    options: [
      'To give her money',
      'To take her to the castle',
      'To let her eat from his plate, sleep in his bed, and kiss her',
      'To help her find her family',
    ],
    correctIndex: 2,
  },
  {
    id: 8,
    text: 'How does Felipe react to Ranita\'s request at first?',
    options: ['He happily agrees', 'He thinks it is funny', 'He thinks it is disgusting', 'He ignores her'],
    correctIndex: 2,
  },
  {
    id: 9,
    text: 'What does Felipe secretly do when he promises Ranita?',
    options: ['He crosses his fingers behind his back', 'He gives her a gift', 'He tells the truth', 'He asks Pepe for help'],
    correctIndex: 0,
  },
  {
    id: 10,
    text: 'Why was Ranita turned into a frog?',
    options: ['She broke a magic arrow', 'She refused to give the old woman a drink from the well', 'She stole something', 'She ran away from home'],
    correctIndex: 1,
  },
  { id: 11, text: 'Felipe is the Viceroy\'s son.', options: ['True', 'False'], correctIndex: 0 },
  { id: 12, text: 'Pepe is Felipe\'s servant.', options: ['True', 'False'], correctIndex: 0 },
  {
    id: 13,
    text: 'The men are happy because they found the golden arrow quickly.',
    options: ['True', 'False'],
    correctIndex: 1,
  },
  {
    id: 14,
    text: 'Ranita is a talking frog.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 15,
    text: 'Felipe politely thanks Ranita for finding the arrow.',
    options: ['True', 'False'],
    correctIndex: 1,
  },
  {
    id: 16,
    text: 'Ranita says a promise is very serious.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 17,
    text: 'Felipe honestly plans to keep his promise.',
    options: ['True', 'False'],
    correctIndex: 1,
  },
  {
    id: 18,
    text: 'After getting the arrow, Felipe runs away.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 19,
    text: 'Ranita begins to cry because Felipe leaves her.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 20,
    text: 'The old woman says Ranita was selfish when she was younger.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
];

const answerKey: KeyItem[] = [
  { id: 1, answer: 'B', explanation: 'The scene is described as a forest clearing near a well.' },
  { id: 2, answer: 'B', explanation: 'The men are searching for a golden arrow.' },
  { id: 3, answer: 'C', explanation: 'Felipe asks, “Have you found my golden arrow yet?”' },
  { id: 4, answer: 'B', explanation: 'Ranita is sitting on top of the well when found.' },
  { id: 5, answer: 'C', explanation: 'She is under a spell.' },
  { id: 6, answer: 'C', explanation: 'Ranita puts the arrow back into the well.' },
  { id: 7, answer: 'C', explanation: 'She asks to eat from his plate, sleep in his bed, and receive a kiss.' },
  { id: 8, answer: 'C', explanation: 'Felipe feels disgusted by the idea of kissing a frog.' },
  {
    id: 9,
    answer: 'A',
    explanation: 'He crosses his fingers, meaning he is not serious about keeping the promise.',
  },
  {
    id: 10,
    answer: 'B',
    explanation: 'The old woman says Ranita was selfish and refused to share water.',
  },
  { id: 11, answer: 'True', explanation: "Felipe is introduced as the Viceroy's son." },
  { id: 12, answer: 'True', explanation: 'Pepe is described as Felipe\'s servant.' },
  { id: 13, answer: 'False', explanation: 'The men are frustrated because they cannot find the arrow.' },
  { id: 14, answer: 'True', explanation: 'Ranita is a talking frog.' },
  { id: 15, answer: 'False', explanation: 'Felipe is rude and demanding, not polite.' },
  { id: 16, answer: 'True', explanation: 'Ranita says a promise is a serious thing.' },
  { id: 17, answer: 'False', explanation: 'He crosses his fingers, showing he may not keep it.' },
  { id: 18, answer: 'True', explanation: 'He bows and runs away after returning the arrow.' },
  { id: 19, answer: 'True', explanation: 'Ranita says she cannot hop that fast and begins to cry.' },
  { id: 20, answer: 'True', explanation: 'The old woman says Ranita was selfish and refused to share water.' },
];

export default function RanitaQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false })),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = () => {
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
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const completedCount = answers.filter((answer) => answer.choice !== null).length;
  const wrongCount = answers.filter((answer) => answer.choice !== null && !answer.isCorrect).length;

  const partLabel = () => {
    if (currentIndex < 10) return 'Part 1 · Multiple Choice';
    return 'Part 2 · True or False';
  };

  const wrongQuestions = questions
    .map((question, index) => ({ question, answer: answers[index] }))
    .filter(({ question, answer }) => answer.choice !== null && answer.choice !== question.correctIndex);

  const currentCorrectAnswerText = `${String.fromCharCode(65 + currentQuestion.correctIndex)}. ${currentQuestion.options[currentQuestion.correctIndex]}`;

  const getKeyLabel = (question: Question): string => {
    const key = answerKey.find((item) => item.id === question.id);
    if (!key) return '';

    if (question.correctIndex === 0 || question.correctIndex === 1) {
      return key.answer;
    }

    return key.answer;
  };

  const getSelectedLabel = (question: Question, answer: Answer): string => {
    if (answer.choice === null) return 'No answer';
    return `${String.fromCharCode(65 + answer.choice)}. ${question.options[answer.choice]}`;
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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Ranita: The Frog Princess</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Reading Comprehension Quiz · 20 questions · One by one review mode</p>
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
                        next[currentIndex] = { choice: index, text: '', isCorrect: isCorrectAnswer };
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
                  selectedOption === currentQuestion.correctIndex ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Correct!</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                      Incorrect. The answer is {currentCorrectAnswerText}.
                    </span>
                  )
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {showFeedback && (
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
              <strong>{wrongCount} wrong</strong>
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
                  const key = answerKey.find((item) => item.id === question.id);
                  const selectedText = getSelectedLabel(question, answer);
                  const correctText = getKeyLabel(question);

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
