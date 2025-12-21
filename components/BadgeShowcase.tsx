
import React from 'react';
import { Badge } from '../types';
import * as LucideIcons from 'lucide-react';

interface BadgeShowcaseProps {
  badges: Badge[];
  newlyEarnedBadgeIds?: string[];
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges, newlyEarnedBadgeIds = [] }) => {
  const getIcon = (iconName: string, isUnlocked: boolean, isNew: boolean) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <IconComponent size={24} className={isNew ? "text-white animate-pulse" : isUnlocked ? "text-amber-500" : "text-slate-300"} />;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {badges.map((badge) => {
        const isNew = newlyEarnedBadgeIds.includes(badge.id);
        return (
          <div 
            key={badge.id}
            className={`relative group p-4 rounded-3xl border transition-all duration-700 flex flex-col items-center text-center ${
              isNew 
                ? 'bg-amber-500 border-amber-400 shadow-xl shadow-amber-500/20 scale-105 z-10 animate-pulse' 
                : badge.isUnlocked 
                  ? 'bg-amber-50 border-amber-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 opacity-60'
            }`}
          >
            {(badge.isUnlocked || isNew) && (
              <div className={`absolute -top-2 -right-2 p-1 rounded-full shadow-lg border-2 border-white animate-in zoom-in-0 duration-500 ${
                isNew ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'
              }`}>
                <LucideIcons.Check size={12} strokeWidth={4} />
              </div>
            )}
            
            <div className={`p-3 rounded-2xl mb-3 transition-transform duration-500 ${
              isNew ? 'bg-white/20 shadow-inner' : badge.isUnlocked ? 'bg-white shadow-inner scale-110 group-hover:rotate-12' : 'bg-slate-200/50'
            }`}>
              {getIcon(badge.icon, badge.isUnlocked, isNew)}
            </div>
            
            <h4 className={`text-[11px] font-black uppercase tracking-tight leading-tight mb-1 ${
              isNew ? 'text-white' : badge.isUnlocked ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {badge.title}
            </h4>
            
            <p className="text-[9px] text-slate-400 font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 bg-slate-800 text-white p-2 rounded-lg z-50 pointer-events-none w-32 shadow-xl">
              {badge.description}
            </p>

            {(badge.earnedDate || isNew) && (
              <span className={`text-[8px] font-black mt-1 uppercase ${isNew ? 'text-white/80' : 'text-amber-600 opacity-60'}`}>
                {isNew ? 'AGORA!' : new Date(badge.earnedDate!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgeShowcase;
