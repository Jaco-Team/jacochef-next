"use server";

import { getDataSSR } from "@/src/api_backend/api";
import dynamic from "next/dynamic";

const RasByBill_ = dynamic(() => import("@/components/ras_by_bill/RasByBill_"), { ssr: false });
export default function RasByBill() {
  return <RasByBill_ />;
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");
  return {
    props: {},
  };
}
