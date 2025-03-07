import { Product } from "@/types";
import ProductCard from "./ProductCard";

const ProductList = ({
  products,
  title,
  limit,
  emptyMessage = "No products found",
}: {
  products: Product[];
  title?: string;
  limit?: number;
  emptyMessage?: string;
}) => {
  console.log(products);

  const displayedProducts = limit
    ? products.slice(0, limit)
    : products;

  return (
    <section className="py-10">
      {title && (
        <h2 className="font-bold text-3xl mb-8">{title}</h2>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <p className="text-muted-foreground text-lg">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
};

export default ProductList;
