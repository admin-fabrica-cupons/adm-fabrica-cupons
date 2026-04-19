import { useContext } from 'react';
import { PostContext } from '../contexts/PostContext';
import { getDefaultCategoryIconName, lucideIcons } from '../utils/icons';
import { FolderTree } from 'lucide-react';

export const useCategoryIcons = () => {
  const { categoryIcons = {} } = useContext(PostContext) || {};

  const getCategoryIcon = (category: string, size: number = 16, className: string = '') => {
    if (!category) return <FolderTree size={size} className={className} />;
    
    // Primeiro tenta usar o ícone personalizado
    const customIconName = categoryIcons[category];
    if (customIconName && lucideIcons[customIconName]) {
      const IconComponent = lucideIcons[customIconName];
      return <IconComponent size={size} className={className} />;
    }
    
    // Depois tenta usar o ícone padrão da categoria
    const defaultIconName = getDefaultCategoryIconName(category);
    if (defaultIconName && lucideIcons[defaultIconName]) {
      const IconComponent = lucideIcons[defaultIconName];
      return <IconComponent size={size} className={className} />;
    }
    
    // Fallback para ícone genérico
    return <FolderTree size={size} className={className} />;
  };

  const getCategoryIconName = (category: string) => {
    if (!category) return 'FolderTree';
    
    // Primeiro tenta usar o ícone personalizado
    const customIconName = categoryIcons[category];
    if (customIconName && lucideIcons[customIconName]) {
      return customIconName;
    }
    
    // Depois tenta usar o ícone padrão da categoria
    const defaultIconName = getDefaultCategoryIconName(category);
    if (defaultIconName && lucideIcons[defaultIconName]) {
      return defaultIconName;
    }
    
    // Fallback para ícone genérico
    return 'FolderTree';
  };

  return {
    getCategoryIcon,
    getCategoryIconName,
    categoryIcons
  };
};