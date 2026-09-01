export const newCategoryTemplate = {
  isNew: true,
  id: null,
  name: "",
  parent_id: 0,
  shelf_life: null,
  items: [],
};

export function getCategoryDTO(item) {
  return {
    id: item.id || null,
    name: item.name || "no name",
    parent_id: item.parent_id || 0,
    shelf_life: item.shelf_life || null,
    items: (item.items || []).map((categoryItem) => ({
      item_id: categoryItem.item_id,
      count: categoryItem.count,
    })),
  };
}
