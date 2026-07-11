import { ContinueWatchingItem } from '../types';

export function getVidLinkUrl(
  tmdbId: string,
  type: 'movie' | 'tv',
  season?: number,
  episode?: number,
  startAt?: number
): string {
  const baseUrl = `https://vidlink.pro/${type}/${tmdbId}`;
  const path = type === 'tv' ? `${baseUrl}/${season || 1}/${episode || 1}` : baseUrl;
  
  const params = new URLSearchParams({
    primaryColor: 'ff0055',
    secondaryColor: '12121a',
    iconColor: 'ff0055',
    icons: 'default',
    title: 'true',
    poster: 'true',
    autoplay: 'false',
    nextbutton: 'true'
  });

  if (startAt && startAt > 0) {
    params.append('startAt', Math.floor(startAt).toString());
  }
  
  return `${path}?${params.toString()}`;
}

export function getContinueWatchingList(): ContinueWatchingItem[] {
  try {
    const raw = localStorage.getItem('vidLinkProgress');
    if (!raw) return [];
    
    // In case the structure in localStorage is an object (map) instead of an array, handle both
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed);
    }
    return [];
  } catch (error) {
    console.error('Error parsing vidLinkProgress from localStorage', error);
    return [];
  }
}

export function saveContinueWatchingItem(item: ContinueWatchingItem) {
  try {
    const list = getContinueWatchingList();
    // Filter out existing item for this id/type
    const filtered = list.filter(
      existing => !(existing.tmdbId === item.tmdbId && existing.type === item.type)
    );
    
    filtered.push({
      ...item,
      lastUpdated: Date.now()
    });
    
    // Limit watch history to last 20 items to conserve space
    const sorted = filtered
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .slice(0, 20);
      
    localStorage.setItem('vidLinkProgress', JSON.stringify(sorted));
  } catch (error) {
    console.error('Error saving progress to localStorage', error);
  }
}

export function removeContinueWatchingItem(tmdbId: string, type: 'movie' | 'tv') {
  try {
    const list = getContinueWatchingList();
    const filtered = list.filter(
      existing => !(existing.tmdbId === tmdbId && existing.type === type)
    );
    localStorage.setItem('vidLinkProgress', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing item from localStorage', error);
  }
}

export function getContinueWatchingItem(tmdbId: string, type: 'movie' | 'tv'): ContinueWatchingItem | undefined {
  const list = getContinueWatchingList();
  return list.find(item => item.tmdbId === tmdbId && item.type === type);
}

export function setupVidLinkMessageListener(
  activeItemGetter: () => { tmdbId: string; type: 'movie' | 'tv'; title: string; posterPath: string | null; backdropPath: string | null; season?: number; episode?: number } | null,
  onProgressUpdate?: (updatedItem: ContinueWatchingItem) => void
) {
  const handleMessage = (event: MessageEvent) => {
    // Check origin
    if (event.origin !== 'https://vidlink.pro') return;

    const eventData = event.data;
    if (!eventData || typeof eventData !== 'object') return;

    // Handle PLAYER_EVENT
    if (eventData.type === 'PLAYER_EVENT') {
      const data = eventData.data;
      console.log(`[VidLink Player Event] Action: ${data?.event}, CurrentTime: ${data?.currentTime}s, Duration: ${data?.duration}s`);
    }

    // Handle MEDIA_DATA
    if (eventData.type === 'MEDIA_DATA') {
      const data = eventData.data;
      if (!data) return;

      const currentTime = data.currentTime || 0;
      const duration = data.duration || 0;
      if (duration === 0) return;

      const progress = currentTime / duration;
      
      // Get currently active item details from calling context
      const active = activeItemGetter();
      if (!active) return;

      // Extract ids from message if present to verify
      const msgTmdbId = data.movieId || data.showId;
      if (msgTmdbId && String(msgTmdbId) !== String(active.tmdbId)) {
        // IDs mismatch, ignore to avoid saving wrong progress
        return;
      }

      const updatedItem: ContinueWatchingItem = {
        tmdbId: active.tmdbId,
        type: active.type,
        title: active.title,
        posterPath: active.posterPath,
        backdropPath: active.backdropPath,
        season: active.season,
        episode: active.episode,
        progress: progress,
        currentTime: currentTime,
        duration: duration,
        lastUpdated: Date.now()
      };

      saveContinueWatchingItem(updatedItem);

      if (onProgressUpdate) {
        onProgressUpdate(updatedItem);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
