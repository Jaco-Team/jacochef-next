import dynamic from "next/dynamic";

const StaffSchedulePage = dynamic(() => import("@/components/staff_schedule/StaffSchedulePage"), {
  ssr: false,
});

export default StaffSchedulePage;
