"use server";

import dynamic from "next/dynamic";
import { getDataSSR } from "@/src/api_backend/api";

const Stat_buy_ = dynamic(() => import("@/components/stat_buy/StatBuy_"), { ssr: false });

export default function StatBuy({ initialData }) {
  return <Stat_buy_ initialData={initialData} />;
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

  const result = await getDataSSR("stat_buy", "get_all", req.headers.cookie);
  // console.log(result)
  if (result?.redirect) {
    return result;
  }
  return {
    props: {
      initialData: result ?? null,
    },
  };
}
