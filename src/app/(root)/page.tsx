import ProductList from "@/components/product/ProductList";
import { getLatestProducts } from "@/lib/actions/product";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <ProductList
      products={latestProducts}
      title="Newest Arrivals"
      limit={LATEST_PRODUCTS_LIMIT}
    />
  );
};

export default Homepage;
