import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Callout } from "fumadocs-ui/components/callout";
import { Shot } from "@/components/shot";
import { ZoomImage } from "@/components/zoom-image";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		img: (props) => <ZoomImage src={String(props.src ?? "")} alt={props.alt} className="rounded-lg border" />,
		ImageZoom: (props) => <ZoomImage src={String(props.src ?? "")} alt={props.alt} className="rounded-lg border" />,
		Step,
		Steps,
		Callout,
		Shot,
		...components,
	};
}
