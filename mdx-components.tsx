import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Callout } from "fumadocs-ui/components/callout";
import { Shot } from "@/components/shot";
import { ZoomImage } from "@/components/zoom-image";
import type { MDXComponents } from "mdx/types";

/**
 * Markdown 圖片（![](/images/…)）會被 fumadocs-mdx 轉成靜態匯入，src 可能是字串，
 * 也可能是 { src, width, height } 物件，兩種都要處理。
 */
function resolveSrc(src: unknown): string {
	if (typeof src === "string") return src;
	if (src && typeof src === "object" && "src" in src && typeof src.src === "string") {
		return src.src;
	}
	return "";
}

function MdxImage(props: { src?: unknown; alt?: string }) {
	return <ZoomImage src={resolveSrc(props.src)} alt={props.alt} className="rounded-lg border" />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		img: MdxImage,
		ImageZoom: MdxImage,
		Step,
		Steps,
		Callout,
		Shot,
		...components,
	};
}
