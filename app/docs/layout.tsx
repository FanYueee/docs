import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { ColoredIcon, tabColor } from "@/lib/tab-colors";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			tree={source.getPageTree()}
			{...baseOptions()}
			tabs={{
				transform(option) {
					return {
						...option,
						icon: option.icon ? (
							<ColoredIcon color={tabColor(option.url)}>{option.icon}</ColoredIcon>
						) : (
							option.icon
						),
					};
				},
			}}
		>
			{children}
		</DocsLayout>
	);
}
