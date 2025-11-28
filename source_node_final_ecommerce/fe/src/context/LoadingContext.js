import { createContext, useContext, useMemo, useState } from "react";

const LoadingContext = createContext({
  spinning: false,
  setSpinning: () => {},
})

// Provider component
export const LoadingProvider = ({ children}) => {
  const [spinning, setSpinning] = useState(false);

  const value = useMemo(
    () => ({
      spinning,
      setSpinning,
    }),
    [spinning]
  );

  return (
    <LoadingContext.Provider value={value} >
      {children}
    </LoadingContext.Provider>
  )
}

// custom hook
export const useGlobalLoading = () => useContext(LoadingContext);