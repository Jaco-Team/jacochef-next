"use server";

import RasByBill_ from "@/components/ras_by_bill/RasByBill_";
import { getDataSSR } from "@/backend/api";

export default function RasByBill({ initialData }) {
  return <RasByBill_ initialData={initialData} />;
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  const result = await getDataSSR("ras_by_bill", "get_all", req.headers.cookie);
  console.log("initialData fetched", result);
  if (result?.redirect) {
    return result;
  }
  return {
    props: {
      initialData: result || null,
    },
  };
}
