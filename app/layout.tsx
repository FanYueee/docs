import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { defineI18n } from "fumadocs-core/i18n";
import type { ReactNode } from "react";
import type { Metadata } from "next";

const { provider } = defineI18nUI(
	defineI18n({ defaultLanguage: "zh-TW", languages: ["zh-TW"] }),
	{
		"zh-TW": {
			displayName: "繁體中文",
			"Search(search trigger)": "搜尋",
			"Search(search dialog)": "搜尋文檔",
			"No results found(search dialog)": "找不到任何結果",
			"Search failed(search dialog)": "搜尋失敗",
			"On this page(table of contents)": "本頁目錄",
			"No Headings(table of contents)": "沒有標題",
			"Table of Contents(inline table of contents)": "目錄",
			"Previous Page(pagination)": "上一頁",
			"Next Page(pagination)": "下一頁",
			"Last updated on(page footer)": "最後更新",
			"Edit on GitHub(edit page)": "在 GitHub 上編輯",
			"Page Not Found(404 page)": "找不到頁面",
			"Back to Home(404 page)": "回到首頁",
			"Skip to Content(skip link)": "跳到內容",
			"Hide Sidebar(sidebar)": "隱藏側邊欄",
			"Show Sidebar(sidebar)": "顯示側邊欄",
			"Light(theme switcher)(aria-label)": "淺色",
			"Dark(theme switcher)(aria-label)": "深色",
			"System(theme switcher)(aria-label)": "跟隨系統",
			"Toggle Theme(theme switcher)(aria-label)": "切換主題",
			"Open Search(search trigger)(aria-label)": "開啟搜尋",
			"Close Search(search dialog)(aria-label)": "關閉搜尋",
			"Open Sidebar(sidebar)(aria-label)": "開啟側邊欄",
			"Close Sidebar(sidebar)(aria-label)": "關閉側邊欄",
			"Toggle Menu(mobile menu)(aria-label)": "切換選單",
		},
	},
);

export const metadata: Metadata = {
	title: {
		template: "%s - vProxy Cloud",
		default: "vProxy Cloud 文檔中心",
	},
	description: "vProxy Cloud 文檔中心",
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="zh-TW" suppressHydrationWarning>
			<body className="flex min-h-screen flex-col">
				<RootProvider i18n={provider("zh-TW")}>{children}</RootProvider>
			</body>
		</html>
	);
}
