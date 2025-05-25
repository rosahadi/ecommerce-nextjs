import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart";
import { getUserById } from "@/lib/actions/user";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutSteps from "@/components/CheckoutSteps";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import PlaceOrderForm from "./place-order-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CreditCard,
  PackageOpen,
  PenSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Place Order",
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("User not found");

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect("/cart");
  if (!user.address) redirect("/shipping-address");
  if (!user.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddress;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <CheckoutSteps current={3} />

      <h1 className="text-3xl font-bold mt-8 mb-6">
        Review & Place Order
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Information Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                <CardTitle>Shipping Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <p className="font-medium text-lg">
                  {userAddress.fullName}
                </p>
                <p className="text-muted-foreground">
                  {userAddress.streetAddress},<br />
                  {userAddress.city}{" "}
                  {userAddress.postalCode},<br />
                  {userAddress.country}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-2"
              >
                <Link
                  href="/shipping-address"
                  className="flex items-center"
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                <CardTitle>Payment Method</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="text-lg font-normal px-3 py-1"
                >
                  {user.paymentMethod}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-2"
              >
                <Link
                  href="/payment-method"
                  className="flex items-center"
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center">
                <PackageOpen className="mr-2 h-5 w-5 text-primary" />
                <CardTitle>Order Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full max-h-[400px]">
                {/* Desktop View */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="text-right">
                          Price
                        </TableHead>
                        <TableHead className="text-right">
                          Subtotal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow
                          key={item.slug}
                          className="border-b"
                        >
                          <TableCell>
                            <Link
                              href={`/product/${item.slug}`}
                              className="flex items-center hover:opacity-80 transition-opacity"
                            >
                              <div className="relative h-16 w-16 mr-4 rounded-md bg-secondary overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-[200px]">
                                <p className="font-medium line-clamp-2">
                                  {item.name}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.size && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Size: {item.size}
                                    </Badge>
                                  )}
                                  {item.color && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Color: {item.color}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.price}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            $
                            {(
                              item.price *
                              (item.quantity || 1)
                            ).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden">
                  {cart.items.map((item) => (
                    <div
                      key={item.slug}
                      className="p-4 border-b last:border-0"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-secondary overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/product/${item.slug}`}
                          >
                            <p className="font-medium mb-1">
                              {item.name}
                            </p>
                          </Link>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.size && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                Size: {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                Color: {item.color}
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-between mt-3">
                            <div className="text-muted-foreground text-sm">
                              {item.quantity} x $
                              {item.price}
                            </div>
                            <div className="font-medium">
                              $
                              {(
                                item.price *
                                (item.quantity || 1)
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Card */}
        <div>
          <Card className="sticky top-24">
            {" "}
            {/* Adjusted top value */}
            <CardHeader className="pb-3 border-b">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Items
                  </span>
                  <span>
                    {formatCurrency(cart.itemsPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Shipping
                  </span>
                  <span>
                    {formatCurrency(cart.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax
                  </span>
                  <span>
                    {formatCurrency(cart.taxPrice)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(cart.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <PlaceOrderForm />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
