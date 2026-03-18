import type { QuizPageProps } from '@/components/quiz/QuizPage';

import { answerKey as jayGrammarAnswerKey, questions as jayGrammarQuestions } from './jay/grammar/9';
import { answerKey as jayMcr51AnswerKey, questions as jayMcr51Questions } from './jay/mcr/5-1';
import { answerKey as jayMcr52AnswerKey, questions as jayMcr52Questions } from './jay/mcr/5-2';
import { answerKey as jayWonder51AnswerKey, questions as jayWonder51Questions } from './jay/wonders/5-1';
import { answerKey as jayWonder52AnswerKey, questions as jayWonder52Questions } from './jay/wonders/5-2';
import { questions as jayWordlyQuestions, answerKey as jayWordlyAnswerKey } from './jay/wordly/4';

import { questions as soyC22Questions } from './soy/c/22';
import { questions as soyC23Questions } from './soy/c/23';
import { questions as soyD1Questions } from './soy/d/1';
import { questions as soyD2Questions } from './soy/d/2';
import { questions as soyD3Questions, vocabTable as soyD3VocabTable, spellingFocusWords as soyD3SpellingFocusWords, misspellings as soyD3Misspellings, sentenceChallengeWords as soyD3SentenceChallengeWords } from './soy/d/3';
import {
  questions as soyD4Questions,
  focusWords as soyD4FocusWords,
  miniPracticeA as soyD4MiniPracticeA,
  reviewAnswers as soyD4ReviewAnswers,
  vocabTable as soyD4VocabTable,
  miniPracticeB as soyD4MiniPracticeB,
} from './soy/d/4';
import {
  questions as soyD5Questions,
  focusWords as soyD5FocusWords,
  miniPracticeA as soyD5MiniPracticeA,
  reviewAnswers as soyD5ReviewAnswers,
  vocabTable as soyD5VocabTable,
  mnemonicList as soyD5MnemonicList,
  miniPracticeB as soyD5MiniPracticeB,
} from './soy/d/5';
import {
  answerKey as soyD6AnswerKey,
  questions as soyD6Questions,
  focusWords as soyD6FocusWords,
  miniPracticeA as soyD6MiniPracticeA,
  miniSpellingChallenge as soyD6MiniSpellingChallenge,
  reviewAnswers as soyD6ReviewAnswers,
  speedReviewPrompts as soyD6SpeedReviewPrompts,
  vocabTable as soyD6VocabTable,
} from './soy/d/6';

type QuizConfig = Omit<QuizPageProps, 'text'> & { text: 'en' | 'ko' };

type QuizCatalog = {
  jay: {
    mcr: {
      '5-1': QuizConfig;
      '5-2': QuizConfig;
    };
    wonders: {
      '5-1': QuizConfig;
      '5-2': QuizConfig;
    };
    grammar: {
      '9': QuizConfig;
    };
    wordly: {
      '4': QuizConfig;
    };
  };
  soy: {
    c: {
      '22': QuizConfig;
      '23': QuizConfig;
    };
    d: {
      '1': QuizConfig;
      '2': QuizConfig;
      '3': QuizConfig;
      '4': QuizConfig;
      '5': QuizConfig;
      '6': QuizConfig;
    };
  };
};

export const quizCatalog: QuizCatalog = {
  jay: {
    mcr: {
      '5-1': {
        text: 'en',
        title: 'Vocabulary Test',
        subtitle: 'Total 20 Questions · Part A 10 + Part B 10 · One by one review mode',
        questions: jayMcr51Questions,
        answerKey: jayMcr51AnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 10) return 'Part A · Multiple Choice';
          return 'Part B · Short Answer';
        },
        normalizeAnswer: (value) =>
          value
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
      },
      '5-2': {
        text: 'en',
        title: 'Vocabulary Test',
        subtitle: 'Total 40 Questions · Part 1 10 + Part 2 10 + Part 3 10 + Part 4 10 · One by one review mode',
        questions: jayMcr52Questions,
        answerKey: jayMcr52AnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 10) return 'Part 1 · Choose the correct meaning';
          if (currentIndex < 20) return 'Part 2 · Choose the correct word';
          if (currentIndex < 30) return 'Part 3 · Fill in the blank (Multiple Choice)';
          return 'Part 4 · Fill in the blank (Short Answer)';
        },
        normalizeAnswer: (value) =>
          value
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
      },
    },
    wonders: {
      '5-1': {
        text: 'en',
        title: 'Ranita: The Frog Princess',
        subtitle: 'Reading Comprehension Quiz · 20 questions · One by one review mode',
        questions: jayWonder51Questions,
        answerKey: jayWonder51AnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 10) return 'Part 1 · Multiple Choice';
          return 'Part 2 · True or False';
        },
      },
      '5-2': {
        text: 'en',
        title: 'Ranita: The Frog Princess',
        subtitle: 'Reading Comprehension Quiz · 20 questions · One by one review mode',
        questions: jayWonder52Questions,
        answerKey: jayWonder52AnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 10) return 'Part 1 · Multiple Choice';
          return 'Part 2 · True or False';
        },
      },
    },
    grammar: {
      '9': {
        text: 'en',
        title: 'Present Continuous Quiz',
        subtitle: 'Total 20 Questions · Part A 10 + Part B 10 · One by one review mode',
        questions: jayGrammarQuestions,
        answerKey: jayGrammarAnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 10) return 'Part A · Multiple Choice';
          return 'Part B · Short Answer';
        },
        normalizeAnswer: (value) =>
          value
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
      },
    },
    wordly: {
      '4': {
        text: 'en',
        title: 'Wordly Vocabulary Test',
        subtitle: 'Total 30 Questions · Part 1 15 + Part 2 15 · One by one review mode',
        questions: jayWordlyQuestions,
        answerKey: jayWordlyAnswerKey,
        partLabel: (currentIndex) => {
          if (currentIndex < 15) return 'Part 1 · Word Definition Matching';
          return 'Part 2 · Sentence Completion';
        },
      },
    },
  },
  soy: {
    c: {
      '22': {
        text: 'ko',
        title: 'Week 22 Vocabulary Test',
        subtitle: '40문제 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기',
        questions: soyC22Questions,
        partLabel: (currentIndex) =>
          currentIndex < 20 ? 'Part 1 · Multiple Choice' : 'Part 2 · Synonym / Antonym',
      },
      '23': {
        text: 'ko',
        title: 'Week 23 Vocabulary Test',
        subtitle: '60문제 · 객관식 40 + 스펠링 20 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기',
        questions: soyC23Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Multiple Choice';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase(),
      },
    },
    d: {
      '1': {
        text: 'ko',
        title: 'Week 1 Vocabulary Test',
        subtitle:
          '60문제 · 객관식 40 + 스펠링 20 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기',
        questions: soyD1Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Multiple Choice';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase(),
      },
      '2': {
        text: 'ko',
        title: 'Week 2 Vocabulary Test',
        subtitle:
          '60문제 · 객관식 40 + 스펠링 20 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기',
        questions: soyD2Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Multiple Choice';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase(),
      },
      '3': {
        text: 'ko',
        title: 'Week 3 Vocabulary Test',
        subtitle:
          '60문제 · 객관식 40 + 스펠링 20 · 한 문제씩 풀고 바로 정답 확인 · 끝나면 틀린 문제만 모아서 보기',
        questions: soyD3Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Multiple Choice';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase().replace(/\s+/g, ' '),
        vocabTable: soyD3VocabTable,
        spellingFocusWords: soyD3SpellingFocusWords,
        misspellings: soyD3Misspellings,
        sentenceChallengeWords: soyD3SentenceChallengeWords,
      },
      '4': {
        text: 'ko',
        title: 'Week 4 Vocabulary Test',
        subtitle: '60 questions · Part A 20 + Part B 20 + Part C 20 · Instant feedback and review after completion',
        questions: soyD4Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part A · Multiple Choice';
          if (currentIndex < 40) return 'Part B · Synonym / Antonym';
          return 'Part C · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase().replace(/\s+/g, ' '),
        vocabTable: soyD4VocabTable,
        focusWords: soyD4FocusWords,
        miniPracticeA: soyD4MiniPracticeA,
        miniPracticeB: soyD4MiniPracticeB,
        miniPracticeBStart: 6,
        reviewAnswers: soyD4ReviewAnswers,
      },
      '5': {
        text: 'ko',
        title: 'Week 5 Vocabulary Test',
        subtitle: '60 questions · Part 1 20 + Part 2 20 + Part 3 20 · Instant feedback and review after completion',
        questions: soyD5Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Word Meaning';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase().replace(/\s+/g, ' '),
        vocabTable: soyD5VocabTable,
        focusWords: soyD5FocusWords,
        miniPracticeA: soyD5MiniPracticeA,
        miniPracticeB: soyD5MiniPracticeB,
        mnemonicList: soyD5MnemonicList,
        reviewAnswers: soyD5ReviewAnswers,
      },
      '6': {
        text: 'ko',
        title: 'Week 6 Vocabulary Test',
        subtitle: '60 questions · Part 1 20 + Part 2 20 + Part 3 20 · Instant feedback and review after completion',
        questions: soyD6Questions,
        partLabel: (currentIndex) => {
          if (currentIndex < 20) return 'Part 1 · Word Meaning';
          if (currentIndex < 40) return 'Part 2 · Synonym / Antonym';
          return 'Part 3 · Spelling';
        },
        normalizeAnswer: (value) => value.trim().toLowerCase().replace(/\s+/g, ' '),
        answerKey: soyD6AnswerKey,
        vocabTable: soyD6VocabTable,
        focusWords: soyD6FocusWords,
        miniPracticeA: soyD6MiniPracticeA,
        miniSpellingChallenge: soyD6MiniSpellingChallenge,
        reviewAnswers: soyD6ReviewAnswers,
        speedReviewPrompts: soyD6SpeedReviewPrompts,
      },
    },
  },
};
