import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/actions/product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Update Product",
};

const AdminProductUpdatePage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;

  const product = await getProductById(id);

  if (!product) return notFound();

  const formattedProduct = {
    ...product,
    price: Number(product.price),
    rating: Number(product.rating),
    discountPercent: product.discountPercent
      ? Number(product.discountPercent)
      : null,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>

      <ProductForm
        type="Update"
        product={formattedProduct}
        productId={product.id}
      />
    </div>
  );
};

export default AdminProductUpdatePage;
