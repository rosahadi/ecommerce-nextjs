import { Category } from "@/types";
import Menu from "./Menu";
import UserButton from "./user-button";

const MenuWrapper = ({
  categories,
}: {
  categories: Category[];
}) => {
  return (
    <Menu
      userButton={<UserButton />}
      categories={categories}
    />
  );
};

export default MenuWrapper;
