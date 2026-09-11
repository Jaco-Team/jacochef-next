import EmployeePromosPage from "../../../components/site_sale_2/EmployeePromosPage";

export async function getServerSideProps({ params }) {
  const rawId = params?.id;

  if (typeof rawId !== "string" || !/^\d+$/.test(rawId)) {
    return { notFound: true };
  }

  const initialPromoCity = Number(rawId);

  if (!Number.isSafeInteger(initialPromoCity) || initialPromoCity < 0) {
    return { notFound: true };
  }

  return {
    props: {
      initialPromoCity,
    },
  };
}

export default function EmployeePromoTemplatePage({ initialPromoCity }) {
  return <EmployeePromosPage initialPromoCity={initialPromoCity} />;
}
