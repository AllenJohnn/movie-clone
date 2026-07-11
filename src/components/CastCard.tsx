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
      whileHover={{ y: -6, scale: 1.04 }}
      className="flex-none w-[110px] sm:w-[130px] md:w-[140px] bg-card-dark/60 rounded-xl overflow-hidden cursor-pointer border border-white/5 shadow-md flex flex-col"
    >
      {/* Profile Photo */}
      <div className="aspect-[3/4] w-full bg-surface-dark relative overflow-hidden">
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
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 text-center bg-gradient-to-br from-card-dark to-surface-dark text-gray-500 font-bold text-xs select-none">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 flex-grow flex flex-col justify-start">
        <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1">
          {person.name}
        </h4>
        <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 mt-0.5 leading-tight font-light">
          {character}
        </p>
      </div>
    </motion.div>
  );
};
