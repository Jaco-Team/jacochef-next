import { getDataSSR } from "@/backend/api";
import CafeEdit from "@/components/cafe_edit/CafeEdit";

export default function CafeEditPage({ initialData, initialPointData }) {
  return (
    <CafeEdit
      initialData={initialData}
      initialPointData={initialPointData}
    />
  );
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

  const initial = { initialData: null, initialPointData: null };
  try {
    const data = await getDataSSR("cafe_edit", "get_all", req.headers.cookie);
    if (data?.redirect) {
      return data;
    }
    initial.initialData = data?.data || null;
    if (data?.data?.points?.length) {
      const point = data.data.points[0];
      const pointData = await getDataSSR("cafe_edit", "get_one", req.headers.cookie, {
        point_id: point.id,
        city_id: point.city_id,
      });
      if (pointData?.redirect) {
        return pointData;
      }
      initial.initialPointData = pointData?.data || null;
    }
    return {
      props: initial,
    };
  } catch (e) {
    console.error(e);
  }
}
