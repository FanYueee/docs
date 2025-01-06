import { Edit } from "lucide-react";
import { getPage, getPages } from "@/app/source";
import type { Metadata } from "next";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { cn } from "@/app/utils/cn";
import { buttonVariants } from "@/app/components/ui/button";
import { Card, Cards } from "fumadocs-ui/components/card";
import { utils, type Page } from "@/app/source";

export default async function Page({
	params,
}: {
	params: { slug?: string[] };
}) {
	const page = getPage(params.slug);

	if (page == null) {
		notFound();
	}

	const MDX = page.data.exports.default;


	return (
		<DocsPage
			toc={page.data.exports.toc}
			full={page.data.full}
			lastUpdate={page.data.exports.lastModified}
			tableOfContent={{
				enabled: Boolean(page.data.exports.toc.length),
			}}
		>
			<DocsBody>
				<h1>{page.data.title}</h1>
				<p className="mb-8 text-lg text-muted-foreground">
					{page.data.description}
				</p>
				<MDX />
				{page.file.name == "index" && page.slugs.length ? (
					<Category page={page} />
				) : null}
			</DocsBody>
		</DocsPage>
	);
}

function Category({ page }: { page: Page }): React.ReactElement {
	const filtered = utils
		.getPages()
		.filter(
			(item) =>
				item.file.dirname === page.file.dirname && item.file.name !== "index"
		);

	return (
		<Cards>
			{filtered.map((item) => (
				<Card
					key={item.url}
					title={item.data.title}
					description={item.data.description ?? "Unknow"}
					href={item.url}
				/>
			))}
		</Cards>
	);
}

export async function generateStaticParams() {
	return getPages().map((page) => ({
		slug: page.slugs,
	}));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
	const page = getPage(params.slug);

	if (page == null) notFound();

	return {
		title: page.data.title,
		description: page.data.description,
	} satisfies Metadata;
}
