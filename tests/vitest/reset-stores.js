import useCafeEditStore from "@/components/cafe_edit/useCafeEditStore";
import useCafeEditModalsStore from "@/components/cafe_edit/useCafeEditModalsStore";

const stores = [useCafeEditStore, useCafeEditModalsStore];

function copyState(state) {
  return Object.fromEntries(
    Object.entries(state).map(([key, value]) => [
      key,
      typeof value === "function" ? value : structuredClone(value),
    ]),
  );
}

const initialStates = stores.map((store) => copyState(store.getInitialState()));

export function resetCafeEditStores() {
  stores.forEach((store, index) => store.setState(copyState(initialStates[index]), true));
}
