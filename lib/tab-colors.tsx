import type { ReactNode } from "react";

// 每個分類（側邊欄頂端下拉選單）使用不同的顏色
const COLORS: Record<string, string> = {
	account: "199 85% 46%", // 天藍
	store: "152 65% 38%", // 綠
	gamecloud: "246 80% 58%", // 品牌靛紫
	support: "330 75% 56%", // 粉紅
	products: "32 92% 50%", // 橘
	minecraft: "98 55% 40%", // 草綠
	troubleshooting: "0 78% 56%", // 紅
};

export function tabColor(url: string): string {
	const key = url.split("/").filter(Boolean)[1] ?? "";
	return COLORS[key] ?? "246 80% 58%";
}

export function ColoredIcon({ color, children }: { color: string; children: ReactNode }) {
	return (
		<div
			className="flex size-full items-center justify-center rounded-md [&_svg]:size-full [&_svg]:p-[3px] md:[&_svg]:p-[2px]"
			style={{
				color: `hsl(${color})`,
				backgroundColor: `hsl(${color} / 0.14)`,
			}}
		>
			{children}
		</div>
	);
}
