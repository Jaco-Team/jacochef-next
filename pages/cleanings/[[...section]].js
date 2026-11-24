import dynamic from "next/dynamic";

const CleaningsPage = dynamic(() => import("@/components/cleanings/CleaningsPage"), {
  ssr: false,
});

export default CleaningsPage;

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store");

  return {
    props: {},
  };
}
