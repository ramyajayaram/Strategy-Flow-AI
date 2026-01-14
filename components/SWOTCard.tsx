
import React from 'react';

interface SWOTCardProps {
  title: string;
  items: string[];
  color: string;
  icon: React.ReactNode;
}

export const SWOTCard: React.FC<SWOTCardProps> = ({ title, items, color, icon }) => {
  return (
    <div className={`p-6 rounded-xl border-2 ${color} bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-gray-600 leading-relaxed">
            <span className="text-gray-400 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
