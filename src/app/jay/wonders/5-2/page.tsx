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
    text: 'Where does Scene 2 take place?',
    options: [
      'In a castle',
      'In a hunting lodge',
      'In a castle bedroom',
      'At a market',
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    text: 'What is Felipe looking for at the beginning of Scene 2?',
    options: ['His hat', 'His golden arrow', 'His sword', 'His book'],
    correctIndex: 1,
  },
  {
    id: 3,
    text: 'What animal causes chaos at the table?',
    options: ['A frog', 'A dog', 'A bird', 'A cat'],
    correctIndex: 0,
  },
  {
    id: 4,
    text: 'What does Ranita say Felipe promised her?',
    options: [
      'To take her home',
      'To let her eat, sleep, and give her a kiss',
      'To make her queen',
      'To give her money',
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    text: 'How does Felipe feel about the frog at first?',
    options: ['Angry and disgusted', 'Happy', 'Excited', 'Proud'],
    correctIndex: 0,
  },
  {
    id: 6,
    text: 'What does the Viceroy say about promises?',
    options: ['Only children make promises', 'The Viceroy’s son keeps his promises', 'They can be broken', 'They are not important'],
    correctIndex: 1,
  },
  {
    id: 7,
    text: 'Where does Scene 3 take place?',
    options: ['In the kitchen', 'In the dining hall', 'In Felipe’s bedroom', 'In the forest'],
    correctIndex: 2,
  },
  {
    id: 8,
    text: 'What does Felipe say he refuses to do?',
    options: ['Leave the house', 'Talk to his father', 'Sleep next to the frog', 'Eat dinner'],
    correctIndex: 2,
  },
  {
    id: 9,
    text: 'What happens when someone kisses Ranita?',
    options: ['She disappears', 'She becomes a bird', 'She becomes a princess', 'She gets angry'],
    correctIndex: 2,
  },
  {
    id: 10,
    text: 'In the end, who becomes Ranita’s husband?',
    options: ['The Viceroy', 'Pepe', 'A prince from another land', 'Felipe'],
    correctIndex: 3,
  },
  { id: 11, text: 'Felipe happily keeps his promise to Ranita.', options: ['False', 'True'], correctIndex: 0 },
  {
    id: 12,
    text: 'The servants are calm when the frog appears.',
    options: ['True', 'False'],
    correctIndex: 1,
  },
  {
    id: 13,
    text: 'Ranita helps Felipe find his golden arrow.',
    options: ['False', 'True'],
    correctIndex: 1,
  },
  {
    id: 14,
    text: 'The Viceroy is angry that Felipe broke his promise.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 15,
    text: 'Felipe wants to kiss the frog.',
    options: ['False', 'True'],
    correctIndex: 0,
  },
  {
    id: 16,
    text: 'Pepe follows Felipe’s orders.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 17,
    text: 'Ranita has been enchanted for 200 years.',
    options: ['False', 'True'],
    correctIndex: 1,
  },
  {
    id: 18,
    text: 'Felipe kisses the frog and breaks the spell.',
    options: ['False', 'True'],
    correctIndex: 0,
  },
  {
    id: 19,
    text: 'Ranita chooses Pepe instead of Felipe.',
    options: ['True', 'False'],
    correctIndex: 0,
  },
  {
    id: 20,
    text: 'In the epilogue, Felipe is polite to the old woman.',
    options: ['False', 'True'],
    correctIndex: 0,
  },
];

const answerKey: KeyItem[] = [
  { id: 1, answer: 'B', explanation: 'Scene 2 is set in a hunting lodge with a banquet.' },
  { id: 2, answer: 'B', explanation: 'Felipe is searching for his lost golden arrow.' },
  { id: 3, answer: 'A', explanation: 'A frog jumps on the table and causes chaos.' },
  { id: 4, answer: 'B', explanation: 'Ranita asks to eat from his plate, sleep in his bed, and get a kiss.' },
  { id: 5, answer: 'A', explanation: 'Felipe is angry and disgusted when he sees the frog.' },
  {
    id: 6,
    answer: 'B',
    explanation: 'The Viceroy tells him that a Viceroy’s son must keep promises.',
  },
  { id: 7, answer: 'C', explanation: 'Scene 3 happens in Felipe’s bedroom.' },
  {
    id: 8,
    answer: 'C',
    explanation: 'Felipe refuses to sleep next to the frog in his room.',
  },
  {
    id: 9,
    answer: 'C',
    explanation: 'A kiss from the right person changes Ranita into a princess.',
  },
  {
    id: 10,
    answer: 'D',
    explanation: 'Ranita is married by Felipe after she becomes a princess.',
  },
  { id: 11, answer: 'False', explanation: 'Felipe refuses and complains instead of happily keeping the promise.' },
  { id: 12, answer: 'False', explanation: 'The servants panic and shout when the frog appears.' },
  { id: 13, answer: 'True', explanation: 'Ranita saved the golden arrow for Felipe.' },
  {
    id: 14,
    answer: 'True',
    explanation: 'The Viceroy is upset about breaking promises and asks Felipe to keep it.',
  },
  { id: 15, answer: 'False', explanation: 'Felipe refuses to kiss the frog at first.' },
  { id: 16, answer: 'True', explanation: 'Pepe carries out what Felipe asks.' },
  { id: 17, answer: 'True', explanation: 'Ranita explains she has been enchanted for 200 years.' },
  {
    id: 18,
    answer: 'False',
    explanation: 'Pepe, not Felipe, finally kisses Ranita and breaks the spell.',
  },
  { id: 19, answer: 'True', explanation: 'Ranita chooses Pepe as her husband in the end.' },
  { id: 20, answer: 'False', explanation: 'Felipe is rude, so this is not polite behavior.' },
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

  const currentCorrectAnswerText = `${String.fromCharCode(65 + currentQuestion.correctIndex)}. ${
    currentQuestion.options[currentQuestion.correctIndex]
  }`;

  const getKeyLabel = (question: Question): string => {
    const key = answerKey.find((item) => item.id === question.id);
    return key ? key.answer : '';
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
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Reading Comprehension Quiz · 20 questions · One by one review mode
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
                      Incorrect. The answer is <strong>'{currentCorrectAnswerText}'</strong>.
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
