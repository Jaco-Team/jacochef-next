import { RecoveryGallery } from "@/design-system/shared/ui/JacoRecoveryScreen.stories";

export default function RecoveryPreview() {
  return <RecoveryGallery />;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (process.env.NODE_ENV !== "development") return { notFound: true };
  return { props: {} };
}
