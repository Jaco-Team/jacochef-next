"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useVendorDetailsStore from "./useVendorDetailsStore";

export default function useVendorLocationsView() {
  const { allCities, mails, vendorCities } = useVendorDetailsStore(
    useShallow((state) => ({
      allCities: state.allCities || [],
      mails: state.mails || [],
      vendorCities: state.vendorCities || [],
    })),
  );

  const selectedCityIds = useMemo(
    () => new Set(vendorCities.map((city) => Number(city.id))),
    [vendorCities],
  );

  const selectedCities = useMemo(() => {
    if (allCities.length) {
      return allCities.filter((city) => selectedCityIds.has(Number(city.id)));
    }

    return vendorCities;
  }, [allCities, selectedCityIds, vendorCities]);

  return { allCities, mails, selectedCities, selectedCityIds, vendorCities };
}
