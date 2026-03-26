'use client';

import { useMemo, useState } from 'react';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type JsonTreeViewerProps = {
  value: JsonValue;
};

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function valueClassName(useColors: boolean, value: JsonValue) {
  if (!useColors) {
    return 'text-slate-700';
  }
  if (value === null) {
    return 'text-slate-500';
  }
  if (typeof value === 'string') {
    return 'text-emerald-700';
  }
  if (typeof value === 'number') {
    return 'text-indigo-700';
  }
  if (typeof value === 'boolean') {
    return 'text-amber-700';
  }
  return 'text-slate-700';
}

function collectNodePaths(value: JsonValue, path = 'root') {
  const paths = [path];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      paths.push(...collectNodePaths(item, `${path}.${index}`));
    });
  } else if (isObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      paths.push(...collectNodePaths(item, `${path}.${key}`));
    });
  }
  return paths;
}

type NodeProps = {
  nodeKey: string;
  nodePath: string;
  value: JsonValue;
  expanded: Set<string>;
  setExpanded: (next: Set<string>) => void;
  depth: number;
  useColors: boolean;
};

function JsonNode({ nodeKey, nodePath, value, expanded, setExpanded, depth, useColors }: NodeProps) {
  const indentStyle = { marginLeft: depth * 12 };
  const isExpandable = Array.isArray(value) || isObject(value);
  const isOpen = expanded.has(nodePath);

  function toggleNode() {
    const next = new Set(expanded);
    if (next.has(nodePath)) {
      next.delete(nodePath);
    } else {
      next.add(nodePath);
    }
    setExpanded(next);
  }

  if (!isExpandable) {
    return (
      <div className="text-xs" style={indentStyle}>
        {nodeKey ? <span className="font-semibold text-slate-500">{nodeKey}: </span> : null}
        <span className={valueClassName(useColors, value)}>
          {typeof value === 'string' ? `"${value}"` : value === null ? 'null' : String(value)}
        </span>
      </div>
    );
  }

  const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : Object.entries(value);

  return (
    <div className="text-xs" style={indentStyle}>
      <button className="mr-1 rounded border border-slate-300 px-1 text-[10px] font-semibold text-slate-600" onClick={toggleNode} type="button">
        {isOpen ? '-' : '+'}
      </button>
      {nodeKey ? <span className="font-semibold text-slate-600">{nodeKey}</span> : null}
      <span className="ml-1 text-slate-400">{Array.isArray(value) ? `Array(${value.length})` : 'Object'}</span>
      {isOpen ? (
        <div className="mt-1 space-y-1">
          {entries.map(([entryKey, entryValue]) => (
            <JsonNode
              key={`${nodePath}.${entryKey}`}
              depth={depth + 1}
              expanded={expanded}
              nodeKey={entryKey}
              nodePath={`${nodePath}.${entryKey}`}
              setExpanded={setExpanded}
              useColors={useColors}
              value={entryValue}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JsonTreeViewer({ value }: JsonTreeViewerProps) {
  const allPaths = useMemo(() => collectNodePaths(value), [value]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(allPaths));
  const [useColors, setUseColors] = useState(true);

  function expandAll() {
    setExpanded(new Set(allPaths));
  }

  function collapseAll() {
    setExpanded(new Set(['root']));
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700" onClick={expandAll} type="button">
          Expand all
        </button>
        <button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700" onClick={collapseAll} type="button">
          Collapse all
        </button>
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          <input checked={useColors} onChange={(event) => setUseColors(event.target.checked)} type="checkbox" />
          Colorize values
        </label>
      </div>
      <JsonNode depth={0} expanded={expanded} nodeKey="" nodePath="root" setExpanded={setExpanded} useColors={useColors} value={value} />
    </div>
  );
}
