import { create } from "zustand";
import { formatDate } from "@/src/helpers/ui/formatDate";

const usePfPlanStore = create((set) => ({
  // Define your initial state here
  module: "pf_plan",
  module_name: "",
  access: {},

  isLoading: false,

  allPoints: [],
  point: null,

  // dateStart: formatDate(),
  // dateEnd: formatDate(),
  week: {
    weekStart: formatDate(),
    weekEnd: formatDate(),
    weekNumber: 1,
  },

  stats: [],
  allPfs: [],

  chartModalOpen: false,
  chartData: null,
  chartPfId: null,

  // actions
}));

export default usePfPlanStore;
