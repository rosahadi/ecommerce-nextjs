"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/lib/actions/cart";

// Custom event for cart updates
export const cartUpdated = () => {
  // Dispatch a custom event when cart is updated
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }
};

const CartButton = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Function to fetch cart count
    const fetchCartCount = async () => {
      const count = await getCartItemCount();
      setCartItemCount(count);
    };

    // Fetch count on initial load
    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    // Clean up event listener
    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );
    };
  }, []);

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-2 bg-primary/5 hover:bg-primary/10"
    >
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        <span>Cart ({cartItemCount})</span>
      </Link>
    </Button>
  );
};

export default CartButton;
