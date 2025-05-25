import { Category } from "@/types";
import Menu from "./Menu";
import UserButton from "./UserButton";

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
