import React from 'react';
import { type CityLeader } from '../data/globalLocationProfiles';

const PersonCard: React.FC<{ leader: CityLeader }> = ({ leader }) => {
  return (
    <div className="p-4 bg-[#0f0f0f] border border-white/10 rounded-lg">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-slate-900 rounded-full overflow-hidden">
          {leader.photoUrl ? <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500">No Photo</div>}
        </div>
        <div>
          <div className="text-lg font-semibold">{leader.name}</div>
          <div className="text-[12px] text-slate-400">{leader.role}</div>
          <div className="text-[12px] text-slate-400">{leader.tenure}</div>
          {leader.contactEmail && <div className="text-[12px] mt-2">Email: <a className="text-amber-300 underline" href={`mailto:${leader.contactEmail}`}>{leader.contactEmail}</a></div>}
          {leader.linkedIn && <div className="text-[12px]">LinkedIn: <a className="text-amber-300 underline" href={leader.linkedIn}>{leader.linkedIn}</a></div>}
        </div>
      </div>
      {leader.bio && <div className="mt-3 text-sm text-slate-300">{leader.bio}</div>}
    </div>
  );
};

export default PersonCard;

