/**
 * Context to hold the id of the medication to edit
 */

import React from 'react';

interface EditMedContextInterface {
  medId: string;
  setMedId: React.Dispatch<React.SetStateAction<string>>;
}

export const EditMedContext = React.createContext<EditMedContextInterface | null>(null);

export const EditMedProvider = ({children}: {children: React.ReactNode}) => {
  const [medId, setMedId] = React.useState<string>('');
  const value = {medId, setMedId};

  return <EditMedContext.Provider value={value}>{children}</EditMedContext.Provider>;
};

