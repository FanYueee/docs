import type { ReactNode } from "react";
import { SHOT_MARKS } from "@/lib/shot-marks";

/** 箭頭：[起點 x, 起點 y, 終點 x, 終點 y]，原始像素 */
export type ShotArrow = [number, number, number, number];

export interface ShotMark {
	/** [x, y, 寬, 高]，以截圖原始像素為單位 */
	box: [number, number, number, number];
	/** 圖片下方對應編號的說明文字 */
	label: ReactNode;
}

/**
 * 帶編號框線的截圖。
 * 框線與編號以 CSS 疊在原圖上（不改動原始截圖），說明文字會自動列在圖片下方。
 */
export function Shot({
	src,
	alt,
	marks: marksProp,
	pick,
	arrows: arrowsProp,
	size: sizeProp,
	crop,
}: {
	src: string;
	alt: string;
	/** 不填的話使用 lib/shot-marks.ts 中這張圖的預設框線 */
	marks?: ShotMark[];
	/** 只顯示預設框線中的某幾個（編號從 1 開始），會重新編號 */
	pick?: number[];
	/** 流程箭頭，不填則使用預設 */
	arrows?: ShotArrow[];
	size?: [number, number];
	/** 只顯示圖片的一部分：[x, y, 寬, 高]（原始像素） */
	crop?: [number, number, number, number];
}) {
	const preset = SHOT_MARKS[src];
	const size = sizeProp ?? preset?.size ?? [1440, 900];
	const all = marksProp ?? preset?.marks ?? [];
	const marks = pick ? pick.map((n) => all[n - 1]).filter(Boolean) : all;
	const arrows = arrowsProp ?? (pick ? [] : preset?.arrows ?? []);
	const [cx, cy, cw, ch] = crop ?? [0, 0, size[0], size[1]];
	const pct = (v: number, total: number) => `${(v / total) * 100}%`;

	return (
		<figure className="not-prose my-5">
			<div
				className="relative w-full overflow-hidden rounded-xl border bg-fd-card shadow-sm"
				style={{ aspectRatio: `${cw} / ${ch}` }}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={src}
					alt={alt}
					loading="lazy"
					className="absolute max-w-none"
					style={{
						width: pct(size[0], cw),
						left: `-${pct(cx, cw)}`,
						top: `-${pct(cy, ch)}`,
					}}
				/>
				{arrows.length > 0 ? (
					<svg
						viewBox={`${cx} ${cy} ${cw} ${ch}`}
						className="pointer-events-none absolute inset-0 size-full"
						aria-hidden
					>
						<defs>
							<marker
								id="shot-arrowhead"
								viewBox="0 0 10 10"
								refX="8"
								refY="5"
								markerWidth="5"
								markerHeight="5"
								orient="auto-start-reverse"
							>
								<path d="M0 0 L10 5 L0 10 z" fill="#f97316" />
							</marker>
						</defs>
						{arrows.map(([x1, y1, x2, y2], i) => (
							<g key={i}>
								<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={9} strokeLinecap="round" />
								<line
									x1={x1}
									y1={y1}
									x2={x2}
									y2={y2}
									stroke="#f97316"
									strokeWidth={5}
									strokeLinecap="round"
									markerEnd="url(#shot-arrowhead)"
								/>
							</g>
						))}
					</svg>
				) : null}
				{marks.map((m, i) => {
					const [x, y, w, h] = m.box;
					return (
						<div
							key={i}
							className={`absolute rounded-md border-2 border-orange-500 shadow-[0_0_0_2px_rgba(255,255,255,0.6)] ${w * h < 120000 ? "bg-orange-500/10" : ""}`}
							style={{
								left: pct(x - cx, cw),
								top: pct(y - cy, ch),
								width: pct(w, cw),
								height: pct(h, ch),
							}}
						>
							<span className="absolute -left-[10px] -top-[10px] flex size-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold leading-none text-white shadow ring-2 ring-white">
								{i + 1}
							</span>
						</div>
					);
				})}
			</div>
			{marks.length > 0 ? (
				<ol className="mt-3 space-y-1.5 text-sm">
					{marks.map((m, i) => (
						<li key={i} className="flex items-center gap-2">
							<span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold leading-none text-white">
								{i + 1}
							</span>
							<span className="text-fd-foreground/90">{m.label}</span>
						</li>
					))}
				</ol>
			) : null}
		</figure>
	);
}
