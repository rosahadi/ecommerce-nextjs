import Menu from "./Menu";
import UserButton from "./user-button";

const MenuWrapper = async () => {
  return <Menu userButton={<UserButton />} />;
};

export default MenuWrapper;
