import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { productService } from '../../../features/catalog/api/productService';
import { getSiteUrl, buildProductJsonLd } from '../../../shared/lib/seo';
import { ensureLeadingSlash } from '../../../shared/lib/slug';
import { ProductDetailClient } from '../../../features/catalog/ui/ProductDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm',
      description: 'Sản phẩm không tồn tại hoặc đã bị gỡ.',
    };
  }

  const title = product.name;
  const description = product.description ?? `Mua ${product.name} chính hãng, giá tốt tại Linh Kiện Chuẩn Giá`;
  const canonical = `/san-pham/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'product',
      title,
      description,
      url: canonical,
      images: [{ url: ensureLeadingSlash(product.images[0] ?? '/images/og-default.jpg') }],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) return notFound();

  const related = await productService.getRelatedProducts(product.slug, 8);

  const url = `${getSiteUrl()}/san-pham/${product.slug}`;
  const jsonLd = buildProductJsonLd({
    url,
    name: product.name,
    description: product.description,
    images: product.images.map((img) => `${getSiteUrl()}${ensureLeadingSlash(img)}`),
    sku: product.id,
    brand: product.brand,
    price: product.price,
    inStock: product.stock > 0,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
