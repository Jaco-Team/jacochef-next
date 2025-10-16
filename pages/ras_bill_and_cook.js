"use server";

import dynamic from "next/dynamic";
import { getDataSSR } from "@/backend/api";

const RasBillAndCook_ = dynamic(() => import("@/components/ras_bill_and_cook/RasBillAndCook_"), {
  ssr: false,
});
export default function RasBillAndCook({ initialData }) {
  return <RasBillAndCook_ initialData={initialData} />;
}

// export async function getServerSideProps({ req, res, query }) {
//   res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

//   // prefetch get_all
//   const resultAll = await getDataSSR("ras_bill_and_cook", "get_all", req.headers.cookie);
//   if (resultAll?.redirect) {
//     return resultAll;
//   }
//   // take point 1 and prefetch rev_list
//   const data = {
//     point_id: resultAll?.data?.points?.[0]?.id ?? null,
//   };

//   const resultRevs = await getDataSSR(
//     "ras_bill_and_cook",
//     "get_rev_list",
//     req.headers.cookie,
//     data
//   );
//   if (resultRevs?.redirect) {
//     return resultRevs;
//   }

//   const initialData = {
//     data: {
//       ...{ ...(resultAll?.data ?? {}) },
//       rev_list: resultRevs?.data ?? [],
//       rev: resultRevs?.data?.[0]?.id ?? null,
//       point: resultAll?.data?.points?.[0]?.id ?? 0,
//     },
//   };
//   return {
//     props: {
//       initialData,
//     },
//   };
// }
