import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Film, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Person as PersonType, MovieOrShow } from '../types';
import { getPersonDetails, getProfileUrl } from '../lib/tmdb';
import { PosterCard } from '../components/PosterCard';

export const Person: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [person, setPerson] = useState<PersonType | null>(null);
  const [credits, setCredits] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const personId = Number(id);

  useEffect(() => {
    const fetchPerson = async () => {
      if (isNaN(personId)) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPersonDetails(personId);
        setPerson(data);

        // Sort credits by popularity descending and filter out items without posters
        const castCredits = data.combined_credits?.cast || [];
        const sorted = [...castCredits]
          .filter(item => item.poster_path)
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
          .slice(0, 30); // limit to top 30 credits
        setCredits(sorted);
      } catch (err) {
        console.error('Error fetching person details:', err);
        setError('Could not retrieve details for this person.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-dark pt-24 text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 flex flex-col md:flex-row gap-8">
          <div className="w-[180px] sm:w-[220px] md:w-[280px] aspect-[3/4] rounded-2xl bg-card-dark animate-shimmer flex-none mx-auto md:mx-0" />
          <div className="flex-grow flex flex-col gap-4">
            <div className="h-10 w-1/3 rounded bg-card-dark animate-shimmer" />
            <div className="h-4 w-1/4 rounded bg-card-dark animate-shimmer" />
            <div className="h-40 w-full rounded bg-card-dark animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white p-6">
        <div className="max-w-md text-center p-8 rounded-2xl bg-surface-dark border border-white/5 shadow-2xl">
          <User size={40} className="text-brand mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-sm text-gray-400 mb-6">{error || 'Person profile not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileUrl = getProfileUrl(person.profile_path);
  const bio = person.biography || 'No biography details available for this person.';
  const hasLongBio = bio.length > 350;
  const displayedBio = isBioExpanded ? bio : `${bio.slice(0, 350)}${hasLongBio ? '...' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark pt-24 px-4 md:px-8 lg:px-12 pb-16 text-left"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer w-fit select-none font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Person details block */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Profile Photo (Left Column) */}
          <div className="w-[180px] sm:w-[240px] md:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden bg-card-dark border border-white/5 shadow-xl flex-none mx-auto md:mx-0">
            {profileUrl ? (
              <img src={profileUrl} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-card-dark to-surface-dark text-gray-500">
                <User size={48} />
                <span className="text-sm font-semibold mt-2 text-center">{person.name}</span>
              </div>
            )}
          </div>

          {/* Person Text Details (Right Column) */}
          <div className="flex-grow flex flex-col justify-start">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
              {person.name}
            </h1>
            
            <p className="text-brand font-semibold text-sm sm:text-base mb-6">
              {person.known_for_department}
            </p>

            {/* Quick Metadata */}
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-400 mb-6 font-light">
              {person.birthday && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <span>Born: {person.birthday}</span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-500" />
                  <span>Place of birth: {person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white border-l-4 border-brand pl-3">Biography</h3>
              <p className="text-gray-300 leading-relaxed font-light text-sm sm:text-base whitespace-pre-line">
                {displayedBio}
              </p>
              {hasLongBio && (
                <button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="text-brand text-xs sm:text-sm font-bold hover:underline cursor-pointer w-fit mt-1 select-none"
                >
                  {isBioExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Known For / Filmography Grid */}
        {credits.length > 0 && (
          <div className="border-t border-white/5 pt-10 mt-6 flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl font-bold text-white border-l-4 border-brand pl-3">
              Known For
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {credits.map((item) => (
                <PosterCard key={`${item.id}-${item.media_type}`} media={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
