import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/brand/logo.png" alt="vProxy Cloud" className="h-7 w-auto" />
					<span className="text-sm font-medium text-fd-muted-foreground">
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
