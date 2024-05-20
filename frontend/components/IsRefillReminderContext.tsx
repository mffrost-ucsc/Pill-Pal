/**
 * Context to share whether the 'send me refill reminders' option is set
 */

import React from 'react';

interface IsRefillReminderContextInterface {
  isRefillReminder: boolean;
  setIsRefillReminder: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IsRefillReminderContext = React.createContext<IsRefillReminderContextInterface | null>(null);

export const IsRefillReminderProvider = ({children}: {children: React.ReactNode}) => {
  const [isRefillReminder, setIsRefillReminder] = React.useState<boolean>(false);
  const value = {isRefillReminder, setIsRefillReminder};

  return <IsRefillReminderContext.Provider value={value}>{children}</IsRefillReminderContext.Provider>;
};