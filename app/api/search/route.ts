import { source } from "@/lib/source";
import { seoDescription } from "@/lib/seo";
import { createFromSource } from "fumadocs-core/search/server";

/**
 * 站內搜尋（Fumadocs 內建引擎，預設的 multilingual 斷詞已支援中文）。
 * 索引時用較完整的描述（lib/seo.ts）取代頁面上的簡短副標題，
 * 讓「怎麼上傳大檔案」這類長句問法，也能對到「SFTP」「檔案」等頁面。
 */
export const { GET } = createFromSource(source, {
	buildIndex(page) {
		return {
			id: page.url,
			title: page.data.title,
			description: seoDescription(page.slugs, page.data.description),
			url: page.url,
			structuredData: page.data.structuredData,
		};
	},
});
