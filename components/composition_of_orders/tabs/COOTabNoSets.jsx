import { useEffect } from "react";
import SortableTable from "./SortableTable";

function COOTabNoSets({ data, getData }) {
  useEffect(() => {
    getData();
  }, []);

  return (
    <SortableTable
      data={data}
      modalTitle={"Динамика продаж по позициям без разбивки сетов"}
    />
  );
}
export default COOTabNoSets;
