import { useEffect } from "react";
import SortableTable from "./SortableTable";

function COOTabBySets({ getData, data }) {
  useEffect(() => {
    getData();
  }, []);

  return (
    <SortableTable
      data={data}
      modalTitle={"Динамика продаж по позициям с разбивкой сетов"}
    />
  );
}
export default COOTabBySets;
