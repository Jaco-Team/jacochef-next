export const newCategoryTemplate = {
  isNew: true,
  id: null,
  name: "",
  parent_id: null,
  shelf_life: null,
};

export function getCategoryDTO(item) {
  return {
    id: item.id || null,
    name: item.name,
    parent_id: item.parent_id || null,
    shelf_life: item.shelf_life || null,
  };
}
