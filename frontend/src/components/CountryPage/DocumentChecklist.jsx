"use client";
import { useState } from "react";

export default function DocumentChecklist({ documents }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(doneCount / documents.length) * 100}%` }}
          />
        </div>
        <span>{doneCount}/{documents.length} ready</span>
      </div>

      {/* Document items */}
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            onClick={() => toggle(doc.id)}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none
              ${checked[doc.id] ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"}`}
          >
            <Checkbox checked={!!checked[doc.id]} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${checked[doc.id] ? "line-through text-gray-400" : ""}`}>
                  {doc.name}
                </span>
                {!doc.mandatory && (
                  <span className="text-xs text-gray-400 border rounded px-1">optional</span>
                )}
                {doc.apostille_required && (
                  <span className="text-xs text-orange-600 border border-orange-200 rounded px-1">
                    apostille
                  </span>
                )}
              </div>
              {doc.details && (
                <p className="text-xs text-gray-500 mt-0.5">{doc.details}</p>
              )}
              {doc.exemptions?.length > 0 && (
                <p className="text-xs text-blue-600 mt-0.5">
                  Exempt: {doc.exemptions.join(", ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">Click a document to mark it as ready</p>
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <div className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 flex items-center justify-center
      ${checked ? "bg-green-500 border-green-500" : "border-gray-300"}`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}
