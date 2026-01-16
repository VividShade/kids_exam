'use client';

import React from 'react';

export default function DailyNotePrintPage() {
  return (
    <div className="min-h-screen bg-gray-200 flex justify-center py-10 print:bg-white">
      <div className="w-[210mm] h-[297mm] p-[10mm] bg-white flex flex-col justify-between">
        <DailyNote />
        <DailyNote />
      </div>
    </div>
  );
}

function DailyNote() {
  return (
    <div className="border border-gray-800 rounded-lg p-3 h-[calc(50%-6mm)] box-border">
      {/* Header */}
      <div className="flex justify-between text-sm mb-2">
        <div>DATE: ________</div>
        <div>D-DAY: ☐</div>
      </div>

      {/* Memo */}
      <div className="border border-gray-400 rounded p-2 mb-3 text-sm">
        <div className="mb-1">MEMO</div>
        <div className="border-b border-dashed border-gray-400 h-5" />
        <div className="border-b border-dashed border-gray-400 h-5" />
        <div className="border-b border-dashed border-gray-400 h-5" />
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-[50px_1fr] gap-x-2 gap-y-1 text-sm">
        {Array.from({ length: 13 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="text-right">{7 + i}:00</div>
            <div className="border-b border-gray-400 h-5" />
          </React.Fragment>
        ))}
      </div>

      {/* Summary */}
      <div className="border border-gray-400 rounded mt-3 p-2 text-sm">
        SUMMARY
        <div className="border-b border-dashed border-gray-400 h-5 mt-1" />
      </div>
    </div>
  );
}
