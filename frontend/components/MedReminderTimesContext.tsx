/**
 * Context to share the med's reminder times
 * References: 
 *  - https://stackoverflow.com/questions/71603110/react-typescript-context-issue-with-type
 *  - https://medium.com/@nitinjha5121/mastering-react-context-with-typescript-a-comprehensive-tutorial-5bab5ef48a3b
 *  - https://www.dhiwise.com/post/a-beginner-guide-to-using-react-context-with-typescript
 */

import React from 'react';

interface MedReminderTimesContextInterface {
  medReminderTimes: Array<Record<string, any>>;
  setMedReminderTimes: React.Dispatch<React.SetStateAction<Array<Record<string, any>>>>;
}

export const MedReminderTimesContext = React.createContext<MedReminderTimesContextInterface | null>(null);

export const MedReminderTimesProvider = ({children}: {children: React.ReactNode}) => {
  const [medReminderTimes, setMedReminderTimes] = React.useState<Array<Record<string, any>>>([]);
  const value = {medReminderTimes, setMedReminderTimes};

  return <MedReminderTimesContext.Provider value={value}>{children}</MedReminderTimesContext.Provider>;
};