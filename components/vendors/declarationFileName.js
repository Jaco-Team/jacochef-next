const HASH_PREFIX_RE = /^(hash|[a-f0-9]{8,}|[a-z0-9-]{12,})$/i;

export function getDeclarationStoredFilename(declaration) {
  return declaration?.filename?.split("/")?.pop() || declaration?.url?.split("/")?.pop() || "";
}

export function getDeclarationDisplayFilename(declaration) {
  const storedFilename = getDeclarationStoredFilename(declaration);

  if (!storedFilename) {
    return "Декларация";
  }

  const underscoreIndex = storedFilename.indexOf("_");

  if (underscoreIndex <= 0) {
    return storedFilename;
  }

  const prefix = storedFilename.slice(0, underscoreIndex);
  const meaningfulPart = storedFilename.slice(underscoreIndex + 1);

  if (!meaningfulPart) {
    return storedFilename;
  }

  return HASH_PREFIX_RE.test(prefix) ? meaningfulPart : storedFilename;
}
