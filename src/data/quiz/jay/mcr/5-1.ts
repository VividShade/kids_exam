// Extracted from src/app/jay/mcr/5-1/page.tsx

// Extracted from src/app/jay/mcr/5-1/page.tsx

import type { QuizQuestion } from '@/components/quiz/QuizTemplate';

export const questions: QuizQuestion[] = [
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

export const answerKey = [
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
