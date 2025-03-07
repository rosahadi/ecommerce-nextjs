import ProductList from "@/components/product/ProductList";
import sampleData from "@/db/sample-data";
import { Product } from "@/types";

const Homepage = () => {
  const products = sampleData.products as Product[];

  return (
    <ProductList
      products={products}
      title="Newest Arrivals"
      limit={3}
    />
  );
};

export default Homepage;
