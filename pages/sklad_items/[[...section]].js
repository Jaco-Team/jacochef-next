import dynamic from "next/dynamic";

const SkladPage = dynamic(() => import("@/components/sklad_items/SkladPage"), { ssr: false });

export default SkladPage;

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store");

  return {
    props: {},
  };
}
