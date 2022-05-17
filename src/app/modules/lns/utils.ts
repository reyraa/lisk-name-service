import { LNSNode } from './data/ls_nodes';

export const addYears = (now: Date, yearsToAdd: number) => {
  const date = new Date(now.getTime());
  date.setFullYear(date.getFullYear() + yearsToAdd); 
  return date;
};

export const isTTLPassed = (lnsObject: LNSNode) => {
  const now = new Date();
  return (lnsObject.updatedAt + lnsObject.ttl) > Math.ceil(now.getTime() / 1000);
}

export const isExpired = (lnsObject: LNSNode) => {
  const now = new Date();
  return (lnsObject.updatedAt + lnsObject.expiry) > Math.ceil(now.getTime() / 1000);
};
