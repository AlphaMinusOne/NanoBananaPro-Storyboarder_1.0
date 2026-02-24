import React, { useState, useEffect } from 'react';
import { Shot, SHOT_TYPES } from '../types';
import { SHOT_TYPE_TRANSLATIONS } from '../constants';
import { Camera, Edit2 } from 'lucide-react';

interface ShotCardProps {
  shot: Shot;
  index: number;
  onUpdate: (index: number, newShot: Shot) => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, index, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(shot.prompt_text);

  useEffect(() => {
    setLocalText(shot.prompt_text);
  }, [shot.prompt_text]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(index, { ...shot, prompt_text: localText });
  };

  const handleShotTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    // Attempt to replace the beginning if it looks like a shot type, otherwise prepend
    let newText = localText;
    const firstCommaIndex = localText.indexOf(',');
    
    if (firstCommaIndex > -1) {
        // Simple heuristic: Assume first segment is shot type if strict
        // But usually safer to just prepend or replace the first few words
        const potentialShotType = localText.substring(0, firstCommaIndex);
        const isExistingType = SHOT_TYPES.some(t => potentialShotType.toLowerCase().includes(t.toLowerCase().replace(" shot", "")));
        
        if (isExistingType) {
            newText = `${newType}${localText.substring(firstCommaIndex)}`;
        } else {
            newText = `${newType}, ${localText}`;
        }
    } else {
        newText = `${newType}, ${localText}`;
    }

    setLocalText(newText);
    onUpdate(index, { ...shot, prompt_text: newText });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col h-full shadow-sm hover:border-banana-500 transition-colors">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
        <span className="text-banana-400 font-bold text-xs uppercase tracking-wider">{shot.shot_number || `分镜 ${index + 1}`}</span>
        
        <div className="flex items-center gap-1">
             <Camera size={14} className="text-slate-400" />
             <select 
                className="bg-slate-900 text-xs text-slate-300 rounded border border-slate-700 p-1 focus:outline-none focus:border-banana-500 max-w-[120px]"
                onChange={handleShotTypeChange}
                defaultValue=""
             >
                <option value="" disabled>更改景别</option>
                {SHOT_TYPES.map(t => (
                    <option key={t} value={t}>
                        {SHOT_TYPE_TRANSLATIONS[t] || t}
                    </option>
                ))}
             </select>
        </div>
      </div>

      <div className="flex-grow relative">
        {isEditing ? (
          <textarea
            className="w-full h-full min-h-[80px] bg-slate-900 text-sm text-slate-200 p-2 rounded border border-banana-500 focus:outline-none resize-none"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="text-sm text-slate-300 cursor-pointer hover:text-white h-full min-h-[80px] whitespace-pre-wrap"
          >
            {localText}
          </div>
        )}
        {!isEditing && (
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-1 bg-slate-800 text-slate-500 hover:text-banana-400 rounded"
            >
                <Edit2 size={12} />
            </button>
        )}
      </div>
    </div>
  );
};

export default ShotCard;