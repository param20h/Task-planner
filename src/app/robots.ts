import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow indexing private user pages
      disallow: [
        "/dashboard",
        "/profile",
        "/admin",
        "/workout",
        "/planner",
        "/journal",
        "/goals",
        "/study",
        "/food",
      ],
    },
    sitemap: "https://zenithflow.dev/sitemap.xml",
  };
}
