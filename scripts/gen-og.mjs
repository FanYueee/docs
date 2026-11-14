#!/usr/bin/env node
/**
 * 為每個文檔頁面輸出社群分享用的預覽圖（1200×630 PNG）到 public/og/docs/。
 *
 * 用法（需要 playwright，建議先 `npx playwright install chromium`）：
 *   OG_FONT=/path/to/NotoSansTC.ttf node scripts/gen-og.mjs [路徑片段 …]
 *   （playwright 裝在別的地方時，加上 PW_MODULE=/path/to/node_modules/playwright/index.mjs）
 *
 * - OG_FONT 為選用：未設定時使用系統內的中文字型（例如 Noto Sans CJK、文泉驛正黑）。
 *   字型只用來繪製圖片，不會被打包進網站。
 * - 標題與描述來自 content/docs 的 frontmatter 與 lib/seo.ts。
 * - 版面刻意使用純色，PNG 才會小；輸出後若系統有 zopflipng 會再做無損壓縮。
 * - 新增或修改頁面標題後重新執行即可；沒有對應圖片的頁面會使用 /og/default.png。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { SEO_DESCRIPTIONS, seoDescription, SITE_DESCRIPTION } from "../lib/seo.ts";

// playwright 不是專案相依套件；可用 PW_MODULE 指定它的安裝位置（index.mjs 的完整路徑）
const { chromium } = await import(process.env.PW_MODULE ?? "playwright");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content/docs");
const OUT = path.join(ROOT, "public/og");
const only = process.argv.slice(2);

const SECTION_LABELS = {
	account: "帳號",
	store: "服務商店",
	gamecloud: "遊戲主機",
	support: "客戶支援",
	minecraft: "Minecraft",
	troubleshooting: "障礙排除",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function walk(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".mdx") ? [path.join(dir, e.name)] : [],
	);
}

function frontmatter(file) {
	const m = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
	const get = (k) => m?.[1].match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1].trim();
	return { title: get("title"), description: get("description") };
}

const pages = walk(CONTENT).map((file) => {
	const rel = path.relative(CONTENT, file).replace(/\.mdx$/, "").split(path.sep);
	if (rel.at(-1) === "index") rel.pop();
	return { slugs: rel, ...frontmatter(file) };
});

const fontFace = process.env.OG_FONT
	? `@font-face{font-family:OGFont;src:url("file://${path.resolve(process.env.OG_FONT)}");font-weight:100 900}`
	: "";

function html({ title, description, section, home }) {
	const len = [...title].length;
	const titleSize = home ? 150 : len <= 8 ? 104 : len <= 12 ? 88 : len <= 18 ? 74 : 62;
	return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFace}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;position:relative;overflow:hidden;background:#f4f2ff;color:#1a1740;
 font-family:OGFont,"Noto Sans TC","Noto Sans CJK TC","WenQuanYi Zen Hei",sans-serif}
.c1{position:absolute;right:-170px;top:-210px;width:620px;height:620px;border-radius:50%;background:#e8e4ff}
.c2{position:absolute;left:-210px;bottom:-290px;width:600px;height:600px;border-radius:50%;background:#e1ebff}
.bar{position:absolute;left:0;top:0;bottom:0;width:16px;background:#5b49f0}
.wrap{position:absolute;inset:0;padding:70px 96px 64px 100px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.top img{height:84px;width:auto}
.chip{font-size:30px;font-weight:700;padding:10px 26px;border-radius:999px;background:#fff;border:2px solid #cfc8ff;color:#4c3fd0}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;gap:26px}
h1{font-size:${titleSize}px;line-height:1.18;font-weight:800;letter-spacing:-1px;color:${home ? "#5b49f0" : "#1a1740"}}
p{font-size:36px;line-height:1.55;color:#4a4778;font-weight:500;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;max-width:980px}
.foot{font-size:28px;font-weight:600;color:#7a76a8;letter-spacing:.5px}
</style></head><body><div class="c1"></div><div class="c2"></div><div class="bar"></div>
<div class="wrap"><div class="top"><img src="file://${ROOT}/public/brand/logo.png">${section ? `<span class="chip">${esc(section)}</span>` : ""}</div>
<div class="main"><h1>${esc(title)}</h1>${description ? `<p>${esc(description)}</p>` : ""}</div>
<div class="foot">docs.vproxy.cloud</div></div></body></html>`;
}

const jobs = [
	// 首頁 / 預設圖
	{ file: path.join(OUT, "default.png"), data: { title: "文檔中心", description: "遊戲主機、Minecraft 伺服器與帳單教學", home: true } },
	...pages
		.filter((p) => p.slugs.length > 0)
		.map((p) => ({
			file: path.join(OUT, "docs", `${p.slugs.join("/")}.png`),
			data: {
				title: p.title,
				description: seoDescription(p.slugs, p.description),
				section: SECTION_LABELS[p.slugs[0]],
			},
		})),
].filter((j) => !only.length || only.some((o) => j.file.includes(o)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const job of jobs) {
	fs.mkdirSync(path.dirname(job.file), { recursive: true });
	// 以 file:// 載入暫存 HTML，才能讀取本機的 logo 與字型
	const tmp = path.join(os.tmpdir(), `og-${process.pid}.html`);
	fs.writeFileSync(tmp, html(job.data));
	await page.goto(`file://${tmp}`, { waitUntil: "load" });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: job.file });
	console.log("rendered", path.relative(ROOT, job.file));
}
await browser.close();

// 無損壓縮（有安裝 zopflipng 才會執行）
if (spawnSync("zopflipng", ["--version"]).status !== null) {
	const files = jobs.map((j) => j.file);
	for (let i = 0; i < files.length; i += 6) {
		await Promise.all(
			files.slice(i, i + 6).map(
				(f) =>
					new Promise((res) => {
						const p = spawnSync("zopflipng", ["-y", "-m", "--iterations=15", f, f]);
						res(p);
					}),
			),
		);
	}
	console.log("compressed", files.length, "files");
}
console.log(`${jobs.length} images (SEO 描述 ${Object.keys(SEO_DESCRIPTIONS).length} 筆；預設描述：${SITE_DESCRIPTION.slice(0, 12)}…)`);
