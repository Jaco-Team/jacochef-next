"use client";

import { createContext, useContext } from "react";

const VendorDetailsContext = createContext(null);

export const VendorDetailsProvider = ({ value, children }) => (
  <VendorDetailsContext.Provider value={value}>{children}</VendorDetailsContext.Provider>
);

export const useVendorDetails = () => {
  const context = useContext(VendorDetailsContext);

  if (!context) {
    throw new Error("useVendorDetails must be rendered inside VendorDetailsProvider");
  }

  return context;
};
