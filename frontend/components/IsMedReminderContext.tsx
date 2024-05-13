/**
 * Context to share whether the 'send me reminders' option is set
 */

import React from 'react';

interface IsMedReminderContextInterface {
  isMedReminder: boolean;
  setIsMedReminder: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IsMedReminderContext = React.createContext<IsMedReminderContextInterface | null>(null);

export const IsMedReminderProvider = ({children}: {children: React.ReactNode}) => {
  const [isMedReminder, setIsMedReminder] = React.useState<boolean>(false);
  const value = {isMedReminder, setIsMedReminder};

  return <IsMedReminderContext.Provider value={value}>{children}</IsMedReminderContext.Provider>;
};