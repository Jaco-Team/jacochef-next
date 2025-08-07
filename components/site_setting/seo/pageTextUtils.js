export function getPageDTO(item) {
  return {
    id: item.id || null,
    page_name: item.page_name,
    link: item.link,
    city_id: item.city_id,
    page_h: item.page_h,
    page_title: item.title,
    page_description: item.description,
    page_text: item.content,
    category_id: item.category_id ? item.category_id.id : 0,
  };
}
