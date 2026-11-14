import { source } from "@/lib/source";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, seoDescription } from "@/lib/seo";

export const revalidate = false;

/** 給 AI 搜尋與助理閱讀的文檔索引（https://llmstxt.org） */
export function GET() {
	const lines = [
		`# ${SITE_NAME}`,
		"",
		`> ${SITE_DESCRIPTION}`,
		"",
		"## 文檔",
		"",
		...source
			.getPages()
			.map((p) => `- [${p.data.title}](${absoluteUrl(p.url)}): ${seoDescription(p.slugs, p.data.description)}`),
		"",
	];
	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
