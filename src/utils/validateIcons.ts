import { getDefaultCategoryIconName, lucideIcons } from './icons';

/**
 * Validates if a given icon name exists in the icon set.
 * @param iconName The name of the icon to validate
 * @returns boolean True if the icon exists, false otherwise
 */
export const isValidIcon = (iconName: string): boolean => {
  return !!lucideIcons[iconName];
};

/**
 * Validates a mapping of categories to icons.
 * @param categoryIcons Record<string, string> mapping categories to icon names
 * @returns Array of error messages (empty if valid)
 */
export const validateCategoryIcons = (categoryIcons: Record<string, string>): string[] => {
  const errors: string[] = [];
  
  Object.entries(categoryIcons).forEach(([category, iconName]) => {
    if (!isValidIcon(iconName)) {
      errors.push(`Categoria '${category}' tem ícone inválido: '${iconName}'`);
    }
  });

  return errors;
};

/**
 * Checks if all categories have an assigned icon (either custom or default fallback).
 * Note: This is stricter than the app logic which has fallbacks.
 * @param categories List of category names
 * @param categoryIcons Current icon mapping
 * @returns Array of categories without specific icons
 */
export const checkMissingIcons = (categories: string[], categoryIcons: Record<string, string>): string[] => {
  return categories.filter(category => {
    if (categoryIcons[category]) return false;
    return !getDefaultCategoryIconName(category);
  });
};
