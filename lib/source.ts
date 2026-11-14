import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon) {
		if (icon && icon in icons) {
			return createElement(icons[icon as keyof typeof icons]);
		}
	},
});

/** 已公開的頁面（排除 frontmatter 標示 unlisted 的頁面），給 sitemap、搜尋、llms.txt 與卡片列表使用 */
export function listedPages() {
	return source.getPages().filter((p) => !p.data.unlisted);
}

/** 站內搜尋用：與 source 相同，但只含已公開的頁面 */
export const listedSource: typeof source = { ...source, getPages: () => listedPages() };
