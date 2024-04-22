/**
 * Context to share whether med information has been updated
 * References: 
 *  - https://stackoverflow.com/questions/71603110/react-typescript-context-issue-with-type
 *  - https://medium.com/@nitinjha5121/mastering-react-context-with-typescript-a-comprehensive-tutorial-5bab5ef48a3b
 *  - https://www.dhiwise.com/post/a-beginner-guide-to-using-react-context-with-typescript
 */

import React from 'react';

interface IsUpdatedContextInterface {
  isUpdated: boolean;
  setUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IsUpdatedContext = React.createContext<IsUpdatedContextInterface | null>(null);

export const IsUpdatedProvider = ({children}: {children: React.ReactNode}) => {
  const [isUpdated, setUpdated] = React.useState<boolean>(false);
  const value = {isUpdated, setUpdated};

  return <IsUpdatedContext.Provider value={value}>{children}</IsUpdatedContext.Provider>;
};
