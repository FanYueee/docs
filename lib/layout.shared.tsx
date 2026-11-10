import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/brand/logo.png" alt="vProxy Cloud" className="h-7 w-auto" />
					<span className="rounded-md bg-fd-accent px-1.5 py-0.5 text-xs font-medium text-fd-accent-foreground">
						文檔中心
					</span>
				</>
			),
		},
		links: [
			{ text: "服務平台", url: "https://portal.vproxy.cloud", external: true },
			{ text: "Discord", url: "https://discord.vproxy.cloud", external: true },
		],
	};
}
