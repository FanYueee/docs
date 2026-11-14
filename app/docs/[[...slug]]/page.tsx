import { source } from "@/lib/source";
import {
	DocsPage,
	DocsBody,
	DocsDescription,
	DocsTitle,
	PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { Card, Cards } from "fumadocs-ui/components/card";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { BRAND_NAME, SITE_NAME, absoluteUrl, pageMetadata, seoDescription, seoTitle } from "@/lib/seo";

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const { slug } = await props.params;
	const page = source.getPage(slug);
	if (!page) notFound();

	const MDX = page.data.body;

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
		>
			<JsonLd page={page} />
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			<DocsBody>
				<MDX components={getMDXComponents()} />
				{page.path.endsWith("index.mdx") && page.slugs.length > 0 ? (
					<Category slugs={page.slugs} />
				) : null}
			</DocsBody>
			{page.data.lastModified ? (
				<PageLastUpdate date={page.data.lastModified} />
			) : null}
		</DocsPage>
	);
}

// 資料夾的 index 頁面底部自動列出同層級頁面的卡片
function Category({ slugs }: { slugs: string[] }) {
	const prefix = `/docs/${slugs.join("/")}/`;
	const items = source
		.getPages()
		.filter((p) => p.url.startsWith(prefix) && p.slugs.length === slugs.length + 1);

	return (
		<Cards>
			{items.map((item) => (
				<Card
					key={item.url}
					title={item.data.title}
					description={item.data.description}
					href={item.url}
				/>
			))}
		</Cards>
	);
}

export function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const page = source.getPage(slug);
	if (!page) notFound();

	return pageMetadata({
		slugs: page.slugs,
		url: page.url,
		title: page.data.title,
		description: page.data.description,
		modified: page.data.lastModified,
	});
}

type DocPage = NonNullable<ReturnType<typeof source.getPage>>;

/** 結構化資料：文章（TechArticle）與麵包屑（BreadcrumbList），協助搜尋引擎理解頁面 */
function JsonLd({ page }: { page: DocPage }) {
	const url = absoluteUrl(page.url);
	const publisher = {
		"@type": "Organization",
		name: BRAND_NAME,
		url: "https://vproxy.cloud",
		logo: { "@type": "ImageObject", url: absoluteUrl("/brand/mark.png") },
	};

	// 只列出實際存在的上層頁面（例如 遊戲主機 → 主控台）
	const crumbs: { name: string; url: string }[] = [{ name: SITE_NAME, url: absoluteUrl("/docs") }];
	for (let i = 1; i < page.slugs.length; i++) {
		const parent = source.getPage(page.slugs.slice(0, i));
		if (parent) crumbs.push({ name: parent.data.title, url: absoluteUrl(parent.url) });
	}
	if (page.slugs.length > 0) crumbs.push({ name: page.data.title, url });

	const graph: Record<string, unknown>[] = [
		{
			"@type": "BreadcrumbList",
			itemListElement: crumbs.map((c, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: c.name,
				item: c.url,
			})),
		},
	];
	if (page.slugs.length === 0) {
		graph.push(
			{
				"@type": "WebSite",
				name: SITE_NAME,
				url: absoluteUrl("/docs"),
				inLanguage: "zh-TW",
				publisher,
			},
			publisher,
		);
	} else {
		graph.push({
			"@type": "TechArticle",
			headline: seoTitle(page.data.title, page.slugs),
			description: seoDescription(page.slugs, page.data.description),
			url,
			mainEntityOfPage: url,
			inLanguage: "zh-TW",
			image: absoluteUrl("/og/default.png"),
			author: publisher,
			publisher,
			...(page.data.lastModified ? { dateModified: page.data.lastModified.toISOString() } : {}),
		});
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
