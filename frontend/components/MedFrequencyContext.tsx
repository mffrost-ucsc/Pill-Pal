/**
 * Context to share the frequency of the medication (for reminders)
 * index 0 = the number of times per interval
 * index 1 = the interval (daily, weekly, etc.)
 */

import React from 'react';

interface MedFrequencyContextInterface {
  medFrequency: [number, string];
  setMedFrequency: React.Dispatch<React.SetStateAction<[number, string]>>;
}

export const MedFrequencyContext = React.createContext<MedFrequencyContextInterface | null>(null);

export const MedFrequencyProvider = ({children}: {children: React.ReactNode}) => {
  const [medFrequency, setMedFrequency] = React.useState<[number, string]>([NaN, '']);
  const value = {medFrequency, setMedFrequency};

  return <MedFrequencyContext.Provider value={value}>{children}</MedFrequencyContext.Provider>;
};