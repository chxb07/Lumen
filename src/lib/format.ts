export const formatPrice = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(n) || 0);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const optimizeUnsplashUrl = (url: string, width = 600) => {
  if (!url || !url.includes("images.unsplash.com")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", width.toString());
    parsed.searchParams.set("q", "80");
    parsed.searchParams.set("auto", "format");
    return parsed.toString();
  } catch {
    return url;
  }
};

