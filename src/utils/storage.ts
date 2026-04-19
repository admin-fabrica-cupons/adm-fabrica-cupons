const STORAGE_KEY = 'fabrica-cupons-pending-posts';

export const savePendingPosts = (posts: any[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getPendingPosts = (): any[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const clearPendingPosts = () => {
  localStorage.removeItem(STORAGE_KEY);
};