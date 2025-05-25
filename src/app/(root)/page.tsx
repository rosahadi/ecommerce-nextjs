import ProductList from "@/components/product/ProductList";
import { getLatestProducts } from "@/lib/actions/product";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <div>
      <ProductList
        products={latestProducts}
        title="Newest Arrivals"
        limit={LATEST_PRODUCTS_LIMIT}
      />

      <div className="flex justify-center pb-10">
        <Link href="/search">
          <Button
            size="lg"
            className="px-8 py-3 text-base font-medium"
          >
            See All Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
