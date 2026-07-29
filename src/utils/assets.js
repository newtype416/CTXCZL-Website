export function assetUrl(path) {
  const relativePath = String(path || '').replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${relativePath}`;
}
