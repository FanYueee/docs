import type { ReactNode } from "react";
import marks from "@/lib/shot-marks.json";
import { ZoomImage } from "@/components/zoom-image";
import { pngSize } from "@/lib/image-size";

type Registry = Record<string, { marks: { box: number[]; label: string }[] }>;
const REGISTRY = marks as Registry;

/** 依 pick 取得燒好框線的圖檔路徑（scripts/bake-shots.py 產生） */
function bakedSrc(src: string, pick?: number[]) {
	if (!pick) return src;
	const i = src.lastIndexOf(".");
	return `${src.slice(0, i)}.p${pick.join("-")}${src.slice(i)}`;
}

/**
 * 截圖：框線與編號已畫在圖片上，圖片下方列出各編號的說明。
 * 框線座標與說明集中在 lib/shot-marks.json，修改後執行 scripts/bake-shots.py 重新輸出圖片。
 *
 * @param src  原始截圖路徑（/images/…）
 * @param pick 只顯示第幾個框線（從 1 開始），會重新編號
 */
export function Shot({
	src,
	alt,
	pick,
	caption,
	width,
	height,
}: {
	src: string;
	alt: string;
	pick?: number[];
	/** 圖片下方的說明（逐步教學用） */
	caption?: ReactNode;
	/** 圖片尺寸；沒有填時讀取 PNG 檔頭 */
	width?: number;
	height?: number;
}) {
	const all = REGISTRY[src]?.marks ?? [];
	const labels: ReactNode[] = (pick ? pick.map((n) => all[n - 1]) : all)
		.filter(Boolean)
		.map((m) => m.label);

	const finalSrc = bakedSrc(src, labels.length ? pick : undefined);
	const size = width && height ? { width, height } : pngSize(finalSrc);

	return (
		<figure className="not-prose my-5 max-md:-mx-4">
			<div className="overflow-hidden border-y bg-fd-card md:rounded-lg md:border">
				<ZoomImage src={finalSrc} alt={alt} width={size?.width} height={size?.height} />
			</div>
			{caption ? <figcaption className="mt-3 text-[0.95rem] leading-7 max-md:px-4">{caption}</figcaption> : null}
			{labels.length > 0 ? (
				<ol className="mt-3 space-y-1.5 text-sm max-md:px-4">
					{labels.map((label, i) => (
						<li key={i} className="flex items-start gap-2">
							<span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold leading-none text-white">
								{i + 1}
							</span>
							<span className="text-fd-foreground/90">{label}</span>
						</li>
					))}
				</ol>
			) : null}
		</figure>
	);
}
