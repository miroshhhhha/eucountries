"use client";
import { useState } from "react";

export default function FinancialCalculator({ requirements }) {
  const [months, setMonths] = useState(12);
  const [extraAdults, setExtraAdults] = useState(0);
  const [children, setChildren] = useState(0);

  const ref = requirements.reference_value_monthly_eur;
  const calc = requirements.calculation_rules;

  const monthly =
    ref * (calc?.first_adult_pct ?? 100) / 100 +
    extraAdults * ref * (calc?.additional_adult_pct ?? 50) / 100 +
    children * ref * (calc?.dependent_child_pct ?? 30) / 100;

  const total = Math.round(monthly * months);

  return (
    <div className="space-y-5">
      {/* Reference value badge */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div>
          <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Reference Value ({requirements.year})</p>
          <p className="text-2xl font-bold text-blue-900">€{ref}/month</p>
          <p className="text-xs text-blue-600 mt-0.5">{requirements.reference_basis}</p>
        </div>
      </div>

      {/* Calculator inputs */}
      <div className="grid grid-cols-3 gap-3">
        <NumberInput
          label="Stay (months)"
          value={months}
          min={1}
          max={60}
          onChange={setMonths}
        />
        <NumberInput
          label="Extra adults"
          value={extraAdults}
          min={0}
          max={5}
          onChange={setExtraAdults}
        />
        <NumberInput
          label="Children (<18)"
          value={children}
          min={0}
          max={5}
          onChange={setChildren}
        />
      </div>

      {/* Result */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <p className="text-sm text-gray-600">Estimated funds required</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">€{total.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">
          €{Math.round(monthly)}/month × {months} months
        </p>
      </div>

      {/* Acceptable proof */}
      {requirements.acceptable_proof?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Accepted as proof of funds</p>
          <ul className="space-y-1">
            {requirements.acceptable_proof.map((p, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {requirements.exemptions?.length > 0 && (
        <p className="text-xs text-gray-500">
          Exempt from financial proof: {requirements.exemptions.join(", ")}
        </p>
      )}
    </div>
  );
}

function NumberInput({ label, value, min, max, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="flex items-center border rounded-lg overflow-hidden">
        <button
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 font-bold"
          onClick={() => onChange(Math.max(min, value - 1))}
        >−</button>
        <span className="flex-1 text-center font-semibold text-sm">{value}</span>
        <button
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 font-bold"
          onClick={() => onChange(Math.min(max, value + 1))}
        >+</button>
      </div>
    </div>
  );
}
