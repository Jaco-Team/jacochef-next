export const GROUPS = [
  { id: 1, name: "Операционные поступления" },
  { id: 2, name: "Операционные платежи" },
];

export const OPERATIONS = [
  { id: 1, group_id: 1, name: "от покупателя" },
  { id: 2, group_id: 1, name: "прочие поступления" },
  { id: 3, group_id: 2, name: "поставщику" },
  { id: 4, group_id: 2, name: "на расходы" },
  { id: 5, group_id: 2, name: "прочие расходы" },
];
