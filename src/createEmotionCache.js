import createCache from "@emotion/cache";

// key must be 'mui' to match MUI's default
export default function createEmotionCache() {
  return createCache({ key: "mui", prepend: true });
}
