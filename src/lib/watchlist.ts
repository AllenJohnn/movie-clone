import { MovieOrShow } from '../types';

export function getWatchlist(): MovieOrShow[] {
  try {
    const raw = localStorage.getItem('aetherWatchlist');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error parsing watchlist from localStorage:', error);
    return [];
  }
}

export function addToWatchlist(media: MovieOrShow) {
  try {
    const list = getWatchlist();
    if (!list.some(item => item.id === media.id)) {
      list.push(media);
      localStorage.setItem('aetherWatchlist', JSON.stringify(list));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
}

export function removeFromWatchlist(id: number) {
  try {
    const list = getWatchlist();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem('aetherWatchlist', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
}

export function isInWatchlist(id: number): boolean {
  const list = getWatchlist();
  return list.some(item => item.id === id);
}
