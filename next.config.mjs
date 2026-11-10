import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	// 舊版文檔網址導向新位置
	async redirects() {
		return [
			{ source: "/docs/panel/server", destination: "/docs/gamecloud", permanent: true },
			{ source: "/docs/panel/server/:path*", destination: "/docs/gamecloud/:path*", permanent: true },
			{ source: "/docs/panel/account", destination: "/docs/account/profile", permanent: true },
			{ source: "/docs/panel/password", destination: "/docs/account/login", permanent: true },
			{ source: "/docs/panel", destination: "/docs/gamecloud", permanent: true },
			{ source: "/docs/store/support", destination: "/docs/support/levels", permanent: true },
			{ source: "/docs/store/discord", destination: "/docs/account/login", permanent: true },
			{ source: "/docs/store/payment/:path*", destination: "/docs/store/billing", permanent: true },
			{ source: "/docs/store/payment", destination: "/docs/store/billing", permanent: true },
			{ source: "/docs/store/services/upgrade", destination: "/docs/store/services", permanent: true },
		];
	},
};

export default withMDX(config);
