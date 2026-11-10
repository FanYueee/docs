"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * 可點擊放大的圖片。
 * - 內文：圖片滿版寬度，手機上整張圖都看得到。
 * - 點擊：全螢幕檢視。桌機縮放到剛好放進視窗；手機放大到 2.5 倍螢幕寬度，可以滑動或雙指縮放看清楚細節。
 */
export function ZoomImage({
	src,
	alt = "",
	className = "",
}: {
	src: string;
	alt?: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				onClick={() => setOpen(true)}
				className={`block h-auto w-full cursor-zoom-in ${className}`}
			/>
			{open ? (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={alt || "圖片檢視"}
					className="fixed inset-0 z-[100] overflow-auto bg-black/85 backdrop-blur-sm"
					onClick={() => setOpen(false)}
				>
					<button
						type="button"
						aria-label="關閉"
						onClick={() => setOpen(false)}
						className="fixed right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg"
					>
						<X className="size-5" />
					</button>
					<div className="flex min-h-full w-max min-w-full items-center justify-center md:p-6">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={src}
							alt={alt}
							onClick={(e) => e.stopPropagation()}
							className="block w-[250vw] max-w-none shrink-0 bg-white md:w-auto md:max-h-[calc(100vh-3rem)] md:max-w-[calc(100vw-3rem)] md:rounded-lg"
						/>
					</div>
				</div>
			) : null}
		</>
	);
}
