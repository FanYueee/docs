import type { MetadataRoute } from "next";
import { listedPages } from "@/lib/source";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
	return listedPages().map((page) => ({
		url: absoluteUrl(page.url),
		lastModified: page.data.lastModified,
		changeFrequency: "monthly" as const,
		priority: page.slugs.length === 0 ? 1 : 0.7,
	}));
}
