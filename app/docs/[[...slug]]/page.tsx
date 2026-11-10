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

	return {
		title: page.data.title,
		description: page.data.description,
	};
}
