import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zenithflow.dev";

  // Public-facing routes that should be indexed by search engines
  const routes = ["", "/pricing", "/privacy", "/terms"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return routes;
}
