import { Category } from "@/types";
import Search from "./search";

const SearchWrapper = async ({
  categories,
}: {
  categories: Category[];
}) => {
  return <Search initialCategories={categories} />;
};

export default SearchWrapper;
