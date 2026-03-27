'use client';

import type { ReactNode } from 'react';

export type SearchSpec =
  | {
      mode: 'none';
      query: '';
      terms: [];
    }
  | {
      mode: 'phrase';
      query: string;
      terms: [string];
    }
  | {
      mode: 'terms';
      query: string;
      terms: string[];
    };

export function formatPercent(correctCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return '0%';
  }
  const raw = (correctCount / totalCount) * 100;
  const rounded = Math.round(raw * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function parseSearchSpec(raw: string): SearchSpec {
  const query = raw.trim();
  if (!query) {
    return { mode: 'none', query: '', terms: [] };
  }

  const first = query[0];
  const last = query[query.length - 1];
  const isQuoted = query.length >= 2 && (first === "'" || first === '"') && first === last;
  if (isQuoted) {
    const phrase = query.slice(1, -1).trim().toLowerCase();
    if (!phrase) {
      return { mode: 'none', query: '', terms: [] };
    }
    return { mode: 'phrase', query, terms: [phrase] };
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  if (terms.length === 0) {
    return { mode: 'none', query: '', terms: [] };
  }
  return { mode: 'terms', query, terms };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSearchableText(input: { title: string; summary: string; outputKeywords: string[] }) {
  return [input.title, input.summary, ...(input.outputKeywords ?? [])].join(' ').toLowerCase();
}

export function sortBySearchSpec<T extends { title: string; summary: string; outputKeywords: string[] }>(
  items: T[],
  spec: SearchSpec,
) {
  if (spec.mode === 'none') {
    return items;
  }

  if (spec.mode === 'phrase') {
    const phrase = spec.terms[0];
    return items.filter((item) => getSearchableText(item).includes(phrase));
  }

  const andMatches: T[] = [];
  const orMatches: T[] = [];
  for (const item of items) {
    const text = getSearchableText(item);
    const matchCount = spec.terms.filter((term) => text.includes(term)).length;
    if (matchCount === spec.terms.length) {
      andMatches.push(item);
      continue;
    }
    if (matchCount > 0) {
      orMatches.push(item);
    }
  }
  return [...andMatches, ...orMatches];
}

export function highlightText(text: string, spec: SearchSpec): ReactNode {
  if (spec.mode === 'none') {
    return text;
  }
  const terms = spec.terms
    .map((term) => term.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (terms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    const isMatch = terms.some((term) => part.toLowerCase() === term);
    if (!isMatch) {
      return <span key={`txt_${index}`}>{part}</span>;
    }
    return (
      <mark key={`hl_${index}`} className="rounded bg-amber-200/70 px-0 text-inherit">
        {part}
      </mark>
    );
  });
}
