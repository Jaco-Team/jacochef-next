import SsoCallback from "@/components/auth/SsoCallback";

export default function AuthCallback() {
  return <SsoCallback />;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Referrer-Policy", "no-referrer");
  return { props: {} };
}
