/**
 * Context to share the Refill Info
 */

import React from 'react';

interface RefillInfoContextInterface {
  refillInfo: [number, number, number];
  setRefillInfo: React.Dispatch<React.SetStateAction<[number, number, number]>>;
}

export const RefillInfoContext = React.createContext<RefillInfoContextInterface | null>(null);

export const RefillInfoProvider = ({children}: {children: React.ReactNode}) => {
  const [refillInfo, setRefillInfo] = React.useState<[number, number, number]>([NaN, NaN, NaN]);
  const value = {refillInfo, setRefillInfo};

  return <RefillInfoContext.Provider value={value}>{children}</RefillInfoContext.Provider>;
};
