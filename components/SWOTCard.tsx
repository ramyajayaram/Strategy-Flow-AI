
import React from 'react';

interface SWOTCardProps {
  title: string;
  items: string[];
  color: string;
  icon: React.ReactNode;
}

export const SWOTCard: React.FC<SWOTCardProps> = ({ title, items, color, icon }) => {
  return (
    <div className={`p-8 rounded-[32px] border-2 ${color} bg-white shadow-lg shadow-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 duration-300`}>
      <div className="flex items-center gap-4 mb-8">
        {icon}
        <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-4 text-slate-600 leading-relaxed group">
            <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></div>
            <span className="font-medium text-[15px]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
