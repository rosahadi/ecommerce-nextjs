import { addItemToCart } from "@/lib/actions/cart";
import AddToCartClient from "./AddToCartClient";
import { CartItem } from "@/types";

const AddToCart = ({ item }: { item: CartItem }) => {
  const addToCartAction = async (cartItem: CartItem) => {
    "use server";
    return await addItemToCart(cartItem);
  };

  return (
    <AddToCartClient
      item={item}
      addToCartAction={addToCartAction}
    />
  );
};

export default AddToCart;
