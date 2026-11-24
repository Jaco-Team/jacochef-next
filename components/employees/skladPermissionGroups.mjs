const SECTIONS = [
  ["warehouse_items", "Товары склада"],
  ["production", "Рецепты и полуфабрикаты"],
  ["site_items", "Товары сайта"],
  ["units", "Единицы измерения"],
];

export function orderSkladPermissionGroups(groups) {
  return groups
    .map((group) => {
      const order = SECTIONS.findIndex(
        ([prefix]) => group.key === prefix || group.key.startsWith(`${prefix}_`),
      );
      if (order < 0) return { ...group, order: SECTIONS.length };
      const [prefix, title] = SECTIONS[order];
      const suffix = group.name
        .replace(/^Рецепты и заготовки\s*[·:]?\s*/i, "")
        .replace(new RegExp(`^${title}\\s*[·:]?\\s*`, "i"), "");
      return {
        ...group,
        name: group.key === prefix || !suffix ? title : `${title} · ${suffix}`,
        order,
      };
    })
    .sort((left, right) => left.order - right.order);
}
