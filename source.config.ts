import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { z } from "zod";

export const docs = defineDocs({
	dir: "content/docs",
	docs: {
		schema: frontmatterSchema.extend({
			/**
			 * 未公開的頁面：可用網址直接開啟，但不出現在側邊欄／上下頁導覽，
			 * 也不進入 sitemap、站內搜尋與 llms.txt，並加上 noindex。
			 * 功能正式上線後，移除這行並把頁面加進 content/docs/meta.json 即可。
			 */
			unlisted: z.boolean().optional(),
		}),
	},
});

export default defineConfig({
	plugins: [lastModified()],
});
