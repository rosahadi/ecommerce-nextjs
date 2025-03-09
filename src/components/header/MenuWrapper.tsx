import Menu from "./menu";
import UserButton from "./user-button";

const MenuWrapper = async () => {
  return <Menu userButton={<UserButton />} />;
};

export default MenuWrapper;
