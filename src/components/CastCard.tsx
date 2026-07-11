import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CastMember, CrewMember } from '../types';
import { getProfileUrl } from '../lib/tmdb';

interface CastCardProps {
  person: CastMember | CrewMember;
}

export const CastCard: React.FC<CastCardProps> = ({ person }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const profilePath = getProfileUrl(person.profile_path);
  const character = 'character' in person ? person.character : (person as CrewMember).job;
  
  const handleClick = () => {
    navigate(`/person/${person.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      className="flex-none flex flex-col items-center text-center w-[85px] sm:w-[105px] md:w-[115px] cursor-pointer group"
    >
      {/* Circular Profile Photo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden bg-surface-dark relative border border-white/5 group-hover:border-brand/40 transition-colors duration-300 shadow-md">
        {profilePath ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-shimmer bg-card-dark" />
            )}
            <img
              src={profilePath}
              alt={person.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-106 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card-dark to-surface-dark text-gray-500 font-bold text-xs select-none">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>

      {/* Centered Profile Text */}
      <div className="flex flex-col items-center mt-2.5 w-full">
        <h4 className="font-semibold text-xs text-white line-clamp-1 group-hover:text-brand transition-colors duration-200">
          {person.name}
        </h4>
        <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-tight font-light w-full">
          {character}
        </p>
      </div>
    </motion.div>
  );
};
