'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type QuestionType = 'mc' | 'short' | 'spelling';

export type QuizQuestion = {
  id: number;
  type?: QuestionType;
  text: string;
  options?: string[];
  correctIndex?: number;
  answer?: string;
};

type QuizAnswer = {
  choice: number | null;
  text: string;
  isCorrect: boolean;
};

type KeyItem = {
  id: number;
  answer: string;
  explanation?: string;
};

type VocabRow = {
  word: string;
  pos: string;
  synonym: string;
  antonym: string;
};

type SpeedReviewPrompt = {
  key: string;
  word: string;
  meaning: string;
};

type QuizText = {
  formatProgress: (completed: number, total: number, correct: number, wrong: number) => {
    left: string;
    right: string;
  };
  formatSummary: (total: number, correct: number, wrong: number, score: number) => ReactNode;
  scoreLine: (score: number) => ReactNode;
  restartLabel: string;
  resultTitle: string;
  wrongReviewTitle: string;
  noWrongMessage: string;
  yourAnswerLabel: string;
  correctAnswerLabel: string;
  noAnswerText: string;
  checkLabel: string;
  nextLabel: string;
  seeResultsLabel: string;
  correctFeedbackLabel: string;
  incorrectFeedbackPrefix: string;
  inputPlaceholder: string;
  questionLabel: string;
};

type AnswerKeyMap = {
  mcAnswers?: string[];
  spellingAnswers?: string[];
};

export const quizTextEn: QuizText = {
  formatProgress: (completed, total, correct, wrong) => ({
    left: `Question ${completed} / ${total}`,
    right: `Correct ${correct} / Wrong ${wrong}`,
  }),
  formatSummary: (total, correct, wrong) => `Out of ${total} questions: ${correct} correct, ${wrong} wrong`,
  scoreLine: (score) => `Score: ${score}%`,
  restartLabel: 'Restart',
  resultTitle: 'Result Summary',
  wrongReviewTitle: 'Wrong Answers Review',
  noWrongMessage: 'No wrong answers. Perfect score!',
  yourAnswerLabel: 'Your answer',
  correctAnswerLabel: 'Correct answer',
  noAnswerText: 'No answer',
  checkLabel: 'Check',
  nextLabel: 'Next',
  seeResultsLabel: 'See Results',
  correctFeedbackLabel: 'Correct!',
  incorrectFeedbackPrefix: 'Incorrect. The answer is',
  inputPlaceholder: 'Type your answer',
  questionLabel: 'Question',
};

export const quizTextKo: QuizText = {
  formatProgress: (completed, total, correct, wrong) => ({
    left: `문제 ${completed} / ${total}`,
    right: `정답 ${correct}개 / 오답 ${wrong}개`,
  }),
  formatSummary: (total, correct, wrong) => `총 ${total}문제 중 ${correct}개 정답, ${wrong}개 오답`,
  scoreLine: (score) => `${score}점`,
  restartLabel: '다시 풀기',
  resultTitle: '결과 요약',
  wrongReviewTitle: '내가 틀린 문제 모음',
  noWrongMessage: '틀린 문제가 없습니다. 완벽해요! 🎉',
  yourAnswerLabel: '내가 입력/선택한 답',
  correctAnswerLabel: '정답',
  noAnswerText: '선택 안 함',
  checkLabel: '정답 확인',
  nextLabel: '다음 문제',
  seeResultsLabel: '결과 보기',
  correctFeedbackLabel: '✅ 정답입니다!',
  incorrectFeedbackPrefix: '❌ 오답입니다. 정답은',
  inputPlaceholder: '정답을 입력하세요',
  questionLabel: '문제',
};

export type QuizTemplateProps = {
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  answerKey?: KeyItem[] | AnswerKeyMap;
  partLabel: (currentIndex: number) => string;
  text: QuizText;
  normalizeAnswer?: (value: string) => string;
  vocabTable?: VocabRow[];
  focusWords?: string[];
  miniPracticeA?: string[];
  miniPracticeB?: string[];
  miniSpellingChallenge?: string[];
  speedReviewPrompts?: SpeedReviewPrompt[];
  answerKeyGroups?: AnswerKeyMap;
  reviewAnswers?: string[];
  spellingFocusWords?: string[];
  misspellings?: string[];
  sentenceChallengeWords?: string[];
  mnemonicList?: string[];
  miniPracticeBStart?: number;
};

export default function QuizTemplate({
  title,
  subtitle,
  questions,
  answerKey,
  partLabel,
  text,
  normalizeAnswer,
  vocabTable,
  focusWords,
  miniPracticeA,
  miniSpellingChallenge,
  speedReviewPrompts,
  answerKeyGroups,
  reviewAnswers,
  spellingFocusWords,
  misspellings,
  sentenceChallengeWords,
  mnemonicList,
  miniPracticeB,
  miniPracticeBStart,
}: QuizTemplateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortInput, setShortInput] = useState('');
  const [answers, setAnswers] = useState<QuizAnswer[]>(() =>
    questions.map(() => ({ choice: null, text: '', isCorrect: false })),
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const normalize = useMemo(
    () =>
      normalizeAnswer ??
      ((value: string) =>
        value
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')),
    [normalizeAnswer],
  );

  const answerMap = useMemo(() => {
    const map = new Map<number, KeyItem>();

    if (Array.isArray(answerKey)) {
      for (const item of answerKey) {
        map.set(item.id, item);
      }
      return map;
    }

    if (answerKey?.mcAnswers || answerKey?.spellingAnswers) {
      const mcAnswers = answerKey.mcAnswers ?? [];
      const spellingAnswers = answerKey.spellingAnswers ?? [];

      for (let index = 0; index < mcAnswers.length; index += 1) {
        map.set(index + 1, { id: index + 1, answer: mcAnswers[index] });
      }

      for (let index = 0; index < spellingAnswers.length; index += 1) {
        map.set(mcAnswers.length + index + 1, { id: mcAnswers.length + index + 1, answer: spellingAnswers[index] });
      }
    }

    return map;
  }, [answerKey]);

  const currentQuestion = questions[currentIndex];
  const getQuestionType = (question: QuizQuestion): QuestionType => {
    if (question.type) return question.type;
    return question.options ? 'mc' : 'short';
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || getQuestionType(currentQuestion) === 'mc' || !currentQuestion.answer) {
      return;
    }

    const isCorrect = normalize(shortInput) === normalize(currentQuestion.answer);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        choice: null,
        text: shortInput,
        isCorrect,
      };
      return next;
    });
    setShowFeedback(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || showFeedback) {
      return;
    }

    const isCorrect = getQuestionType(currentQuestion) === 'mc' && optionIndex === currentQuestion.correctIndex;
    setSelectedOption(optionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        choice: optionIndex,
        text: '',
        isCorrect,
      };
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
    setShortInput('');
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShortInput('');
    setAnswers(questions.map(() => ({ choice: null, text: '', isCorrect: false })));
    setShowFeedback(false);
    setIsFinished(false);
  };

  const totalQuestions = questions.length;

  const isCorrectAnswer = (question: QuizQuestion, answer: QuizAnswer) => {
    if (getQuestionType(question) === 'mc') {
      return answer.choice !== null && answer.choice === question.correctIndex;
    }

    return normalize(answer.text) === normalize(question.answer ?? '');
  };

  const isAnswered = (question: QuizQuestion, answer: QuizAnswer) => {
    if (getQuestionType(question) === 'mc') {
      return answer.choice !== null;
    }
    return answer.text.trim().length > 0;
  };

  const correctCount = answers.filter((answer, index) => isCorrectAnswer(questions[index], answer)).length;
  const completedCount = answers.filter((answer, index) => isAnswered(questions[index], answer)).length;
  const wrongCount = answers.filter((answer, index) => isAnswered(questions[index], answer) && !isCorrectAnswer(questions[index], answer)).length;

  const wrongQuestions = questions.filter((q) => {
    const answer = answers[q.id - 1];
    return answer && isAnswered(q, answer) && !isCorrectAnswer(q, answer);
  });

  const getCorrectLabel = (question: QuizQuestion) =>
    getQuestionType(question) === 'mc'
      ? question.correctIndex === undefined || !question.options
        ? ''
        : `${String.fromCharCode(65 + question.correctIndex)}. ${question.options[question.correctIndex]}`
      : question.answer ?? '';

  const getSelectedText = (question: QuizQuestion, answer: QuizAnswer) => {
    if (getQuestionType(question) === 'mc') {
      if (answer.choice === null) return text.noAnswerText;
      return question.options?.[answer.choice] ?? text.noAnswerText;
    }

    return answer.text.trim() || text.noAnswerText;
  };

  const getAnswerKeyDisplay = (question: QuizQuestion, answerKeyItem: KeyItem | undefined) => {
    if (getQuestionType(question) === 'mc') {
      return answerKeyItem?.answer ?? getCorrectLabel(question);
    }

    return question.answer ?? '';
  };

  const answerKeyGroupsBySource: AnswerKeyMap = useMemo(() => {
    if (answerKeyGroups) return answerKeyGroups;
    if (!answerKey || Array.isArray(answerKey)) return {};
    return {
      mcAnswers: answerKey.mcAnswers,
      spellingAnswers: answerKey.spellingAnswers,
    };
  }, [answerKey, answerKeyGroups]);

  const progress = text.formatProgress(completedCount, totalQuestions, correctCount, wrongCount);
  const score = Math.round((correctCount / totalQuestions) * 100);

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
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{subtitle}</p>
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
              {progress.left}
            </span>
            <span>
              {progress.right}
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
                {partLabel(currentIndex)}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                {text.questionLabel} {currentQuestion.id}. {currentQuestion.text}
              </h2>
            </div>

            {getQuestionType(currentQuestion) === 'mc' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentQuestion.options?.map((option, index) => {
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
                      key={option}
                      type="button"
                      onClick={() => handleSelectOption(index)}
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
                  value={shortInput}
                  onChange={(event) => {
                    if (showFeedback) return;
                    setShortInput(event.target.value);
                  }}
                  placeholder={text.inputPlaceholder}
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
                    {getQuestionType(currentQuestion) === 'mc' ? (
                      selectedOption === currentQuestion.correctIndex ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{text.correctFeedbackLabel}</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          {text.incorrectFeedbackPrefix} {getCorrectLabel(currentQuestion)}.
                        </span>
                      )
                    ) : isCorrectAnswer(currentQuestion, answers[currentIndex]) ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{text.correctFeedbackLabel}</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        {text.incorrectFeedbackPrefix} {getCorrectLabel(currentQuestion)}.
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
                    {currentIndex === questions.length - 1 ? text.seeResultsLabel : text.nextLabel}
                  </button>
                ) : null}

                {!showFeedback && getQuestionType(currentQuestion) !== 'mc' ? (
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
                    {text.checkLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{text.resultTitle}</h2>
            <p style={{ fontSize: 14, marginBottom: 4 }}>{text.formatSummary(totalQuestions, correctCount, wrongCount, score)}</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>{text.scoreLine(score)}</p>

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
              {text.restartLabel}
            </button>

            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{text.wrongReviewTitle}</h3>
            {wrongQuestions.length === 0 ? <p style={{ fontSize: 14 }}>{text.noWrongMessage}</p> : null}
            {wrongQuestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wrongQuestions.map((q) => {
                  const idx = q.id - 1;
                  const ans = answers[idx];
                  const selectedText = getSelectedText(q, ans);
                  const answerText = getAnswerKeyDisplay(q, answerMap.get(q.id));
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
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{text.questionLabel} {q.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{q.text}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {text.yourAnswerLabel}: <strong>{selectedText}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {text.correctAnswerLabel}: <strong>{answerText}</strong>
                      </div>
                      {q.type === 'mc' ? (
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                          {answerMap.get(q.id)?.explanation}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {vocabTable ? (
              <>
                <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Vocabulary Summary Table</h3>
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
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
              </>
            ) : null}

            {focusWords ? (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Difficult Words Intensive Review</h3>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Spelling Focus List</div>
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
              </>
            ) : null}

            {miniPracticeA ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Mini Practice 1. Fill in the blank</div>
                <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
                  {miniPracticeA.map((item) => (
                    <li key={item} style={{ marginBottom: 4 }}>
                      {item}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}

            {miniPracticeB ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Mini Practice 2. Word Form Challenge</div>
                {miniPracticeBStart === undefined || miniPracticeBStart <= 1 ? (
                  <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
                    {miniPracticeB.map((item) => (
                      <li key={item} style={{ marginBottom: 4 }}>
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol
                    start={miniPracticeBStart}
                    style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}
                  >
                    {miniPracticeB.map((item) => (
                      <li key={item} style={{ marginBottom: 4 }}>
                        {item}
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : null}

            {miniSpellingChallenge ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Mini Practice 2. Spelling challenge</div>
                <ol style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, fontSize: 14 }}>
                  {miniSpellingChallenge.map((item, idx) => (
                    <li key={item} style={{ marginBottom: 4 }}>
                      {`${idx + 1}. ${item}`}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}

            {spellingFocusWords ? (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Spelling Intensive Review Set</h3>
                <div style={{ fontSize: 14, marginBottom: 10 }}>
                  <strong>Step 1 - Look carefully</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {spellingFocusWords.map((word) => (
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
                  <strong>Step 2 - Cover and Write</strong>: Write each word 3 times.
                </div>
              </>
            ) : null}

            {misspellings ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Step 3 - Spot the mistake</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {misspellings.map((word) => (
                    <span
                      key={word}
                      style={{
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: 999,
                        padding: '5px 10px',
                        fontSize: 13,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            {sentenceChallengeWords ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Step 4 - Sentence Challenge</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sentenceChallengeWords.map((word) => (
                    <span
                      key={word}
                      style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        borderRadius: 999,
                        padding: '5px 10px',
                        fontSize: 13,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            {mnemonicList ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Quick Memory Method</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {mnemonicList.map((item) => (
                    <div key={item} style={{ fontSize: 13, background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {speedReviewPrompts ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Mini Practice 3. Speed review</div>
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
              </>
            ) : null}

            {answerKeyGroupsBySource.mcAnswers || answerKeyGroupsBySource.spellingAnswers ? (
              <>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Answer Key</div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  <strong>Part 1 (1–20):</strong>{' '}
                  {answerKeyGroupsBySource.mcAnswers?.slice(0, 20).join(' ')}
                </div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  <strong>Part 2 (21–40):</strong>{' '}
                  {answerKeyGroupsBySource.mcAnswers?.slice(20, 40).join(' ')}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <strong style={{ fontSize: 13 }}>Part 3 (41–60):</strong>
                  <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    {(answerKeyGroupsBySource.spellingAnswers ?? []).map((item, idx) => (
                      <div key={item + idx} style={{ background: '#f0fdf4', padding: 6, borderRadius: 8 }}>
                        {41 + idx}. {item}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {reviewAnswers ? (
              <>
                <div style={{ fontSize: 14 }}>Wrong answer review</div>
                <p style={{ fontSize: 13 }}>{reviewAnswers.join(' | ')}</p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
