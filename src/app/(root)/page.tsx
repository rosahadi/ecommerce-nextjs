import ProductList from "@/components/product/ProductList";
import { getLatestProducts } from "@/lib/actions/product";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <ProductList
      products={latestProducts}
      title="Newest Arrivals"
      limit={4}
    />
  );
};

export default Homepage;
