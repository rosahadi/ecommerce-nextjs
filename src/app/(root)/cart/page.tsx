import CartTable from "./CartTable";
import { getMyCart } from "@/lib/actions/cart";

export const metadata = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const cart = await getMyCart();

  return <CartTable cart={cart} />;
};

export default CartPage;
