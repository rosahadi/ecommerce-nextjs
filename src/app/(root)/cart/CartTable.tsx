"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  addItemToCart,
  removeItemFromCart,
} from "@/lib/actions/cart";
import {
  ArrowRight,
  Loader,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { Cart, CartItem } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, round2 } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function AddButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      variant="outline"
      size="sm"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const itemToAdd = {
            ...item,
            quantity: 1,
          };

          const res = await addItemToCart(itemToAdd);

          if (!res.success) {
            toast.error("", {
              description: res.message,
            });
          }
        })
      }
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
    </Button>
  );
}

function RemoveButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      variant="outline"
      size="sm"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await removeItemFromCart(
            item.productId,
            false,
            item.color,
            item.size
          );

          if (!res.success) {
            toast.error("", {
              description: res.message,
            });
          }
        })
      }
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Minus className="w-4 h-4" />
      )}
    </Button>
  );
}

function DeleteButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      disabled={isPending}
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await removeItemFromCart(
            item.productId,
            true,
            item.color,
            item.size
          );

          if (!res.success) {
            toast.error("", {
              description: res.message,
            });
          } else {
            toast.success("Item removed from cart");
          }
        })
      }
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}

// Mobile cart item component
function MobileCartItem({
  item,
  getColorDisplay,
}: {
  item: CartItem;
  getColorDisplay: (
    color: string | null | undefined
  ) => React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex gap-3 mb-3">
        <div className="relative w-20 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <Link href={`/product/${item.slug}`}>
            <h3 className="font-medium line-clamp-2">
              {item.name}
            </h3>
          </Link>
          {item.discountPercent &&
            item.discountPercent > 0 && (
              <Badge
                variant="outline"
                className="text-green-600 bg-green-50 mt-1"
              >
                On Sale
              </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {item.size && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Size:
            </span>
            <Badge variant="outline" className="ml-1">
              {item.size}
            </Badge>
          </div>
        )}
        {item.color && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Color:
            </span>
            {getColorDisplay(item.color)}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          <RemoveButton item={item} />
          <span className="w-8 text-center">
            {item.quantity}
          </span>
          <AddButton item={item} />
        </div>

        <div className="text-right">
          {item.discountPercent &&
          item.discountPercent > 0 ? (
            <div>
              <span className="line-through text-muted-foreground text-sm">
                ${item.price}
              </span>
              <div className="font-medium">
                ${item.discountedPrice}
              </div>
            </div>
          ) : (
            <div className="font-medium">${item.price}</div>
          )}
        </div>

        <div className="ml-2">
          <DeleteButton item={item} />
        </div>
      </div>
    </div>
  );
}

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Helper to format the product variations
  const getColorDisplay = (
    color: string | null | undefined
  ) => {
    if (!color) return null;

    return (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        ></div>
        <span className="text-sm">{color}</span>
      </div>
    );
  };

  return (
    <div className="container px-4 md:px-6 py-4 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold py-4">
        Shopping Cart
      </h1>
      {!cart || cart?.items?.length === 0 ? (
        <div className="text-center py-8 border rounded-lg p-6 bg-gray-50">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="mb-4 text-lg">
            Your cart is empty.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Cart View - Hidden on mobile */}
          <div className="hidden md:block lg:col-span-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">
                      Product
                    </TableHead>
                    <TableHead>Variations</TableHead>
                    <TableHead className="text-center">
                      Qty
                    </TableHead>
                    <TableHead className="text-right">
                      Price
                    </TableHead>
                    <TableHead className="text-right">
                      Total
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart?.items?.map((item) => (
                    <TableRow
                      key={`${item.slug}-${item.color || "no-color"}-${item.size || "no-size"}`}
                    >
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="relative w-20 h-20 rounded bg-gray-100 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {item.name}
                            </h3>
                            {item.discountPercent &&
                              item.discountPercent > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 bg-green-50"
                                >
                                  On Sale
                                </Badge>
                              )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {item.size && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Size:
                              </span>
                              <Badge variant="outline">
                                {item.size}
                              </Badge>
                            </div>
                          )}
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Color:
                              </span>
                              {getColorDisplay(item.color)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <RemoveButton item={item} />
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <AddButton item={item} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discountPercent &&
                        item.discountPercent > 0 ? (
                          <div>
                            <span className="line-through text-muted-foreground text-sm">
                              ${item.price}
                            </span>
                            <div className="font-medium">
                              ${item.discountedPrice}
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium">
                            ${item.price}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          round2(
                            (item.discountedPrice ||
                              item.price) *
                              (item.quantity || 1)
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <DeleteButton item={item} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cart View - Shown only on mobile */}
          <div className="md:hidden lg:col-span-3 space-y-2">
            {cart?.items?.map((item) => (
              <MobileCartItem
                key={`mobile-${item.slug}-${item.color || "no-color"}-${item.size || "no-size"}`}
                item={item}
                getColorDisplay={getColorDisplay}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                  Order Summary
                </h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(cart.itemsPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {formatCurrency(
                        cart.shippingPrice || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      {formatCurrency(cart.taxPrice || 0)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          cart.totalPrice || cart.itemsPrice
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() =>
                        router.push("/shipping-address")
                      )
                    }
                  >
                    {isPending ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Checkout
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartTable;
