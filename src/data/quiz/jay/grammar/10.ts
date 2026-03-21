import type { QuizQuestion } from '@/components/quiz/QuizTemplate';

// Extracted from src/app/jay/grammar/10/page.tsx

export const questions: QuizQuestion[] = [
  { id: 1, type: 'mc', text: 'Is she reading a book?', options: ['Yes, she does.', 'Yes, she is.', 'She reads.', 'Yes, she do.'], correctIndex: 1 },
  { id: 2, type: 'mc', text: 'What are you doing now?', options: ['Yes, I am.', 'I do my homework.', 'I am doing my homework.', 'Yes, I do.'], correctIndex: 2 },
  { id: 3, type: 'mc', text: 'Are they playing soccer?', options: ['Yes, they are.', 'Yes, they do.', 'They are play.', 'Yes, they is.'], correctIndex: 0 },
  { id: 4, type: 'mc', text: 'Where is Tom going?', options: ['Yes, he is.', 'He goes to school.', 'He going to school.', 'He is going to school.'], correctIndex: 3 },
  { id: 5, type: 'mc', text: 'Is it raining outside?', options: ['Yes, it does.', 'Yes, it is.', 'It rains.', 'Yes, it do.'], correctIndex: 1 },
  { id: 6, type: 'mc', text: 'What is she cooking?', options: ['She cooks dinner.', 'Yes, she is.', 'She is cooking dinner.', 'Yes, she does.'], correctIndex: 2 },
  { id: 7, type: 'mc', text: 'Are you watching TV?', options: ['Yes, I watch.', 'Yes, I do.', 'Yes, I am.', 'I watching TV.'], correctIndex: 2 },
  { id: 8, type: 'mc', text: 'Where are they staying?', options: ['Yes, they are.', 'They are staying in a hotel.', 'They stay in a hotel.', 'Yes, they do.'], correctIndex: 1 },
  { id: 9, type: 'mc', text: 'Is he running fast?', options: ['Yes, he is.', 'Yes, he does.', 'He run fast.', 'Yes, he do.'], correctIndex: 0 },
  { id: 10, type: 'mc', text: 'What are you eating?', options: ['Yes, I am.', 'I eat pizza.', 'Yes, I do.', 'I am eating pizza.'], correctIndex: 3 },
  { id: 11, type: 'mc', text: 'Are the kids sleeping?', options: ['Yes, they are.', 'Yes, they do.', 'They sleeping.', 'Yes, they is.'], correctIndex: 0 },
  { id: 12, type: 'mc', text: 'Where is she working?', options: ['Yes, she is.', 'She works at a bank.', 'She is working at a bank.', 'Yes, she does.'], correctIndex: 2 },
  { id: 13, type: 'mc', text: 'Is your brother studying?', options: ['Yes, he studies.', 'Yes, he is.', 'Yes, he do.', 'He studying.'], correctIndex: 1 },
  { id: 14, type: 'mc', text: 'What is the dog doing?', options: ['It runs.', 'Yes, it is.', 'Yes, it does.', 'It is barking.'], correctIndex: 3 },
  { id: 15, type: 'mc', text: 'Are we learning English?', options: ['Yes, we do.', 'Yes, we are.', 'We learning English.', 'Yes, we is.'], correctIndex: 1 },
  { id: 16, type: 'mc', text: 'Where are you going?', options: ['Yes, I am.', 'I go home.', 'I am going home.', 'Yes, I do.'], correctIndex: 2 },
  { id: 17, type: 'mc', text: 'Is she writing an email?', options: ['Yes, she does.', 'Yes, she is.', 'She write an email.', 'Yes, she do.'], correctIndex: 1 },
  { id: 18, type: 'mc', text: 'What are they building?', options: ['They build a house.', 'Yes, they are.', 'Yes, they do.', 'They are building a house.'], correctIndex: 3 },
  { id: 19, type: 'mc', text: 'Are you listening to music?', options: ['Yes, I do.', 'Yes, I am.', 'I listening music.', 'Yes, I is.'], correctIndex: 1 },
  { id: 20, type: 'mc', text: 'Where is he sitting?', options: ['Yes, he is.', 'He sits on the chair.', 'He is sitting on the chair.', 'Yes, he does.'], correctIndex: 2 },
];

export const answerKey = [
  { id: 1, answer: 'B' },
  { id: 2, answer: 'C' },
  { id: 3, answer: 'A' },
  { id: 4, answer: 'D' },
  { id: 5, answer: 'B' },
  { id: 6, answer: 'C' },
  { id: 7, answer: 'C' },
  { id: 8, answer: 'B' },
  { id: 9, answer: 'A' },
  { id: 10, answer: 'D' },
  { id: 11, answer: 'A' },
  { id: 12, answer: 'C' },
  { id: 13, answer: 'B' },
  { id: 14, answer: 'D' },
  { id: 15, answer: 'B' },
  { id: 16, answer: 'C' },
  { id: 17, answer: 'B' },
  { id: 18, answer: 'D' },
  { id: 19, answer: 'B' },
  { id: 20, answer: 'C' },
];
