export const newPageTemplate = {
  isNew: true,
  page_name: "",
  city_id: -1,
  page_h: "",
  title: "",
  description: "",
  link: "",
  content: "",
  category_id: 0,
};

export function getPageDTO(item) {
  return {
    id: item.id || null,
    page_id: item.page_id,
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

export function translit(word) {
  const map = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "sh",
    ь: "",
    ы: "y",
    ъ: "",
    э: "e",
    ю: "iu",
    я: "ia",
    " ": "_",
    "%": "",
  };
  return word
    .toLowerCase()
    .split("")
    .map((l) => map[l] || (/[a-z0-9]/.test(l) && l) || "")
    .join("");
}
