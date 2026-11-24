import dynamic from "next/dynamic";

const StaffScheduleRatesPage = dynamic(
  () => import("@/components/staff_schedule/rates/StaffScheduleRatesPage"),
  {
    ssr: false,
  },
);

export default StaffScheduleRatesPage;
