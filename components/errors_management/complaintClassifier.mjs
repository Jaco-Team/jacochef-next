export function activeNodes(catalog, kind, parentId = null) {
  return catalog.filter(
    (node) =>
      node.kind === kind &&
      Boolean(node.is_active) &&
      (parentId === null || Number(node.parent_id) === Number(parentId)),
  );
}

export function completeClassifier(catalog, draft, categoryId) {
  const types = activeNodes(catalog, "error_type", categoryId);
  const errorTypeId = types.length === 1 ? String(types[0].id) : "";
  const errors = errorTypeId ? activeNodes(catalog, "error", errorTypeId) : [];
  return {
    ...draft,
    category_id: String(categoryId || ""),
    error_type_id: errorTypeId,
    error_id: errors.length === 1 ? String(errors[0].id) : "",
  };
}

export function classifierDraft(catalog, objectType, positionKey = null) {
  const categories = activeNodes(catalog, "category").filter((node) =>
    node.rules?.object_types?.includes(objectType),
  );
  const draft = {
    object_type: objectType,
    position_key: positionKey,
    category_id: "",
    error_type_id: "",
    error_id: "",
    stage_id: "",
    solution_id: "",
    error_amount: "",
    comment: "",
  };
  return categories.length === 1 ? completeClassifier(catalog, draft, categories[0].id) : draft;
}

export function validComplaintError(error, catalog, positions, stages) {
  const category = catalog.find(
    (node) =>
      String(node.id) === String(error.category_id) && node.kind === "category" && node.is_active,
  );
  const type = catalog.find(
    (node) =>
      String(node.id) === String(error.error_type_id) &&
      node.kind === "error_type" &&
      node.is_active &&
      String(node.parent_id) === String(category?.id),
  );
  const selectedError = catalog.find(
    (node) =>
      String(node.id) === String(error.error_id) &&
      node.kind === "error" &&
      node.is_active &&
      String(node.parent_id) === String(type?.id),
  );
  const stage = stages.find((item) => String(item.id) === String(error.stage_id));
  const allowedStage = selectedError?.rules?.stage_ids?.some(
    (id) => String(id) === String(stage?.id),
  );
  const position = positions.find((item) => item.position_key === error.position_key);
  const objectValid =
    category?.rules?.object_types?.includes(error.object_type) &&
    (["dish", "extra", "delivery"].includes(error.object_type)
      ? position?.type === error.object_type
      : !error.position_key);
  const ingredientValid =
    !selectedError?.rules?.requires_ingredient ||
    position?.ingredients?.some((item) => String(item.id) === String(error.ingredient_id));
  return Boolean(
    category && type && selectedError && stage && allowedStage && objectValid && ingredientValid,
  );
}
