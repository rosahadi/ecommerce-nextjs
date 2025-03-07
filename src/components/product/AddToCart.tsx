"use client";

import { useTransition } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart, CartItem } from "@/types";

const AddToCart = ({
  cart,
  item,
  showQuantity = false,
}: {
  cart?: Cart;
  item: CartItem;
  showQuantity?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  // Check if item exists in cart
  const existItem = cart?.items.find(
    (x) => x.productId === item.productId
  );

  // Add to cart handler
  const handleAddToCart = async () => {
    console.log("add");
  };

  // Remove from cart handler
  const handleRemoveFromCart = async () => {
    console.log("remove");
  };

  if (existItem && showQuantity) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          size="icon"
          variant="outline"
          onClick={handleRemoveFromCart}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>

        <span className="font-medium text-sm">
          {existItem.qty}
        </span>

        <Button
          size="icon"
          variant="outline"
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={showQuantity ? "default" : "icon"}
      variant={existItem ? "secondary" : "default"}
      onClick={handleAddToCart}
      disabled={isPending}
      title="Add to cart"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {showQuantity && (
            <span className="ml-2">Add to cart</span>
          )}
        </>
      )}
    </Button>
  );
};

export default AddToCart;
