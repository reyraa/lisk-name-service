export const addYears = (now: Date, yearsToAdd: number) => {
  const date = new Date(now.getTime());
  date.setFullYear(date.getFullYear() + yearsToAdd); 
  return date;
};

export const isTTLPassed = () => {
  
}
