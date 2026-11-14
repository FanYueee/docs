import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

/** 正式網址（Vercel 預覽環境可用 NEXT_PUBLIC_SITE_URL 覆蓋） */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.vproxy.cloud").replace(/\/$/, "");
export const SITE_NAME = "vProxy Cloud 文檔中心";
export const SITE_DESCRIPTION =
	"vProxy Cloud 文檔中心：帳號登入、服務商店購買與付款、遊戲主機管理、Minecraft 自訂域名與連線問題排除教學。";
export const BRAND_NAME = "vProxy Cloud";
export const HOME_TITLE = `${SITE_NAME}｜遊戲主機、Minecraft 伺服器與帳單教學`;

export const OG_IMAGE = {
	url: "/og/default.png",
	width: 1200,
	height: 630,
	alt: SITE_NAME,
};

/**
 * 頁面專屬的預覽圖（scripts/gen-og.mjs 產生在 public/og/docs/）；
 * 還沒有對應圖片的頁面使用預設圖。
 */
export function ogImage(slugs: string[], alt?: string) {
	if (slugs.length > 0) {
		const url = `/og/docs/${slugs.join("/")}.png`;
		if (fs.existsSync(path.join(process.cwd(), "public", url))) {
			return { url, width: 1200, height: 630, alt: alt ?? SITE_NAME };
		}
	}
	return OG_IMAGE;
}

/** 網址路徑 → 絕對網址 */
export function absoluteUrl(path: string) {
	return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 搜尋結果標題會加上所屬分類，讓只有短標題（例如「主控台」）的頁面更容易被找到 */
const SECTION_LABELS: Record<string, string> = {
	account: "帳號",
	store: "服務商店",
	gamecloud: "遊戲主機",
	support: "客戶支援",
	minecraft: "Minecraft",
	troubleshooting: "障礙排除",
};

export function seoTitle(title: string, slugs: string[]) {
	const section = SECTION_LABELS[slugs[0] ?? ""];
	if (!section || title.includes(section)) return title;
	return `${title} - ${section}`;
}

/**
 * 搜尋結果用的描述（約 50～80 字）。
 * 頁面上顯示的副標題（frontmatter description）維持簡短，這裡放比較完整的版本；
 * 沒有列在這裡的頁面會使用 frontmatter 的 description。
 * key 為網址路徑（不含 /docs/ 前綴，首頁為空字串）。
 */
export const SEO_DESCRIPTIONS: Record<string, string> = {
	"": SITE_DESCRIPTION,
	"account/login":
		"說明如何使用 AtomRoute 帳號註冊並登入 vProxy Cloud 服務平台（portal.vproxy.cloud），包含沒有帳號與忘記密碼時的處理方式。",
	"account/profile":
		"第一次登入 vProxy Cloud 後，需先填寫姓名、電話與帳單地址才能購買服務。說明填寫與儲存步驟，以及儲存後鎖定、如何更正資料。",
	"store/start":
		"認識 vProxy Cloud 服務商店的總覽、商品、我的服務、帳單與通知，並跟著新手導覽的五個步驟開始購買服務。",
	"store/products":
		"介紹 vProxy Cloud 服務商店的產品線（Minecraft、網頁主機、Discord 機器人、Hytale、Steam 遊戲等），以及如何選擇地點與方案。",
	"store/buy":
		"從選擇方案、配置規格、加入購物車，到建立帳單與付款，一步步完成 vProxy Cloud 服務的購買流程。",
	"store/billing":
		"查看 vProxy Cloud 帳單，選擇信用卡、Apple Pay 或 ATM 轉帳付款，並說明取消續費帳單與通知的使用方式。",
	"store/services":
		"在「我的服務」查看已購買服務的狀態、費用、到期日與計費週期，並進入服務詳情管理或取消服務。",
	"store/services/cancel":
		"說明如何申請在目前計費週期結束後取消 vProxy Cloud 服務，以及取消前要注意的不退款與備份事項。",
	"gamecloud":
		"vProxy Cloud 遊戲主機管理介面總覽：主控台、檔案、備份、排程、使用者、網路與設定等功能的位置與用途。",
	"gamecloud/console":
		"使用遊戲主機主控台啟動、停止與重新啟動 Minecraft 伺服器，輸入指令、查看即時日誌與 CPU、記憶體等資源用量。",
	"gamecloud/files":
		"在網頁上瀏覽、上傳、編輯、壓縮與移動遊戲伺服器檔案（例如修改 server.properties），不需要額外安裝軟體。",
	"gamecloud/sftp":
		"使用 FileZilla 以 SFTP 連線遊戲伺服器，上傳與下載大型檔案或整個資料夾，包含取得連線資訊與重設 SFTP 密碼。",
	"gamecloud/databases":
		"查看遊戲主機的 MySQL 資料庫額度，說明尚未購買額度時如何加購，供外掛與模組使用。",
	"gamecloud/schedules":
		"設定遊戲伺服器排程：每天固定時間自動公告、重新啟動或執行指令，並說明任務順序、延遲時間與失敗處理。",
	"gamecloud/backups":
		"建立、下載、鎖定與還原遊戲伺服器備份，說明備份額度、建立步驟，以及還原前該注意的事項。",
	"gamecloud/users":
		"邀請朋友成為遊戲伺服器的使用者，並以僅檢視、操作員或自訂權限，控制他們可以操作的功能。",
	"gamecloud/network":
		"查看遊戲伺服器的內網主機名稱、網路流量歷史、月流量計算與連線位址。",
	"gamecloud/startup":
		"查看與調整 Minecraft 伺服器的啟動指令、Java 版本與遊戲版本（Minecraft Version、Build Number、Server Jar File）。",
	"gamecloud/settings":
		"修改遊戲伺服器名稱與說明、取得 SFTP 連線資訊與除錯資訊，並說明重新安裝伺服器前的注意事項。",
	"gamecloud/analytics":
		"在遊戲主機的「紀錄 → 分析」查看 CPU、記憶體、硬碟與網路使用量的歷史變化，判斷是否需要升級方案。",
	"gamecloud/alerts":
		"設定遊戲主機告警：CPU、記憶體或硬碟使用量過高時，透過 Discord Webhook 或 Telegram 立即通知你。",
	"gamecloud/activity":
		"在遊戲主機的「紀錄 → 操作紀錄」查看伺服器的操作歷史，包含時間、操作帳號、操作內容與狀態。",
	"support/tickets":
		"在客戶支援系統建立與追蹤客服單：填寫問題、選擇相關服務與優先級，並了解如何回覆與結案。",
	"support/levels":
		"比較 vProxy Cloud 基本、標準、進階與企業四種支援等級的費用、回應時間（P1～P3）與支援管道。",
	"minecraft/domain":
		"用 Cloudflare 新增 SRV 記錄，讓玩家以自訂域名（例如 play.example.com）連線 Minecraft Java 版伺服器，不必輸入 IP 與埠號。",
	"troubleshooting/tracert":
		"使用 Windows 內建的 tracert 指令追蹤網路路由，並查詢自己的 IP，提供給技術人員診斷連線問題。",
	"troubleshooting/ai":
		"教你用 ChatGPT、Gemini 等 AI 工具分析 Minecraft 伺服器的錯誤日誌，快速診斷並解決伺服器問題。",
};

export function seoDescription(slugs: string[], fallback?: string) {
	return SEO_DESCRIPTIONS[slugs.join("/")] ?? fallback ?? SITE_DESCRIPTION;
}

/** 單一文檔頁面的 metadata：標題、描述、canonical、Open Graph 與 Twitter Card */
export function pageMetadata(opts: {
	slugs: string[];
	url: string;
	title: string;
	description?: string;
	modified?: Date;
}): Metadata {
	const isHome = opts.slugs.length === 0;
	const title = isHome ? HOME_TITLE : seoTitle(opts.title, opts.slugs);
	const fullTitle = isHome ? HOME_TITLE : `${title} | ${SITE_NAME}`;
	const description = seoDescription(opts.slugs, opts.description);
	const image = ogImage(opts.slugs, fullTitle);
	return {
		title: isHome ? { absolute: HOME_TITLE } : title,
		description,
		alternates: { canonical: opts.url },
		openGraph: {
			type: isHome ? "website" : "article",
			url: opts.url,
			title: fullTitle,
			description,
			siteName: SITE_NAME,
			locale: "zh_TW",
			images: [image],
			...(opts.modified ? { modifiedTime: opts.modified.toISOString() } : {}),
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			images: [image.url],
		},
	};
}
