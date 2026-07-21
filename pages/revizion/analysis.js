import RevisionAnalysisPage from "@/components/revizion/RevisionAnalysisPage";

export default function RevizionAnalysis() {
  return <RevisionAnalysisPage version="classic" />;
}

export { getServerSideProps } from "@/pages/revizion";
