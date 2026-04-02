export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getDayIndex = (date: Date): number => {
  const index = date.getDay(); // 0 is Sunday, 1 is Monday...
  return index === 0 ? 6 : index - 1; // Adjust to 0: Monday, 6: Sunday
};
