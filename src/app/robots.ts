import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/interview", "/practice", "/profile", "/progress", "/salary", "/onboarding", "/api/"],
            },
        ],
        sitemap: "https://cracktherole.com/sitemap.xml",
    };
}
