import type { Metadata } from 'next';

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function buildTitle(title: string) {
  return `${title} | Linh Kiện Chuẩn Giá`;
}

export function buildProductJsonLd(input: {
  url: string;
  name: string;
  description?: string;
  images: string[];
  sku?: string;
  brand?: string;
  price: number;
  currency?: string;
  inStock: boolean;
}) {
  const currency = input.currency ?? 'VND';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.images,
    sku: input.sku,
    brand: input.brand
      ? {
          '@type': 'Brand',
          name: input.brand,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: input.url,
      priceCurrency: currency,
      price: input.price,
      availability: input.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function buildCategoryMetadata(input: {
  title: string;
  description: string;
  canonicalPath: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.canonicalPath,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.canonicalPath,
      type: 'website',
    },
  };
}
