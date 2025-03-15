"use client";
import { Badge } from "@/components/ui/badge";
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
import {
  formatCurrency,
  formatDateTime,
  formatId,
} from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";
import { useTransition } from "react";
import StripePayment from "./stripe-payment";
import { toast } from "sonner";
import Image from "next/image";
import {
  deliverOrder,
  updateOrderToPaidCOD,
} from "@/lib/actions/order";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  CreditCard,
  PackageOpen,
} from "lucide-react";

const OrderDetailsTable = ({
  order,
  isAdmin,
  stripeClientSecret,
}: {
  order: Omit<Order, "paymentResult">;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const {
    id,
    shippingAddress,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order;

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(
              order.id
            );
            toast("", {
              description: res.message,
            });
          })
        }
      >
        {isPending ? "Processing..." : "Mark As Paid"}
      </Button>
    );
  };

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            toast("", {
              description: res.message,
            });
          })
        }
      >
        {isPending ? "Processing..." : "Mark As Delivered"}
      </Button>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mt-8 mb-6">
        Order {formatId(id)}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
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
                  {paymentMethod}
                </Badge>
              </div>
              {isPaid ? (
                <Badge variant="secondary" className="mt-2">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="mt-2"
                >
                  Not Paid
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                <CardTitle>Shipping Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <p className="font-medium text-lg">
                  {shippingAddress.fullName}
                </p>
                <p className="text-muted-foreground">
                  {shippingAddress.streetAddress},<br />
                  {shippingAddress.city}{" "}
                  {shippingAddress.postalCode},<br />
                  {shippingAddress.country}
                </p>
              </div>
              {isDelivered ? (
                <Badge variant="secondary" className="mt-2">
                  Delivered at{" "}
                  {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="mt-2"
                >
                  Not Delivered
                </Badge>
              )}
            </CardContent>
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
                    {orderitems?.map((item) => (
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
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader className="pb-3 border-b">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Items
                  </span>
                  <span>{formatCurrency(itemsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Shipping
                  </span>
                  <span>
                    {formatCurrency(shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax
                  </span>
                  <span>{formatCurrency(taxPrice)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              {!isPaid &&
                paymentMethod === "STRIPE" &&
                stripeClientSecret && (
                  <StripePayment
                    priceInCents={
                      Number(order.totalPrice) * 100
                    }
                    orderId={order.id}
                    clientSecret={stripeClientSecret}
                  />
                )}
              {isAdmin &&
                !isPaid &&
                paymentMethod === "CASH_ON_DELIVERY" && (
                  <MarkAsPaidButton />
                )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsTable;
