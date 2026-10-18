// Resolve the app root from its module asset, including nested static hosting.
export const appBase = new URL(/* @vite-ignore */ "../", import.meta.url).pathname;
export const demoPath = `${appBase}demonstracao/`;
