import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';

import { productService } from '../../../features/catalog/api/productService';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await productService.getById(id);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm',
      description: 'Sản phẩm không tồn tại hoặc đã bị gỡ.',
    };
  }

  return {
    title: product.name,
    description: product.description ?? `Mua ${product.name} chính hãng giá tốt tại Linh Kiện Chuẩn Giá`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await productService.getById(id);
  if (!product) return notFound();
  redirect(`/san-pham/${product.slug}`);
}
