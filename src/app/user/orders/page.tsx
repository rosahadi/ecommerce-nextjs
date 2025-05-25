import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order";
import {
  formatCurrency,
  formatDateTime,
  formatId,
} from "@/lib/utils";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders | StreetWear",
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;

  const orders = await getMyOrders({
    page: Number(page) || 1,
  });

  return (
    <Card className="border-none shadow-lg bg-background">
      <CardHeader className="pb-0">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
          YOUR ORDERS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto rounded-lg border border-muted">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  Total
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  Delivery
                </TableHead>
                <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm text-foreground">
                    {formatId(order.id)}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {
                      formatDateTime(order.createdAt)
                        .dateTime
                    }
                  </TableCell>
                  <TableCell className="text-sm font-bold text-foreground">
                    {formatCurrency(
                      Number(order.totalPrice)
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Paid
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-destructive border-destructive"
                      >
                        Unpaid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered &&
                    order.deliveredAt ? (
                      <Badge className="bg-primary hover:bg-primary/90">
                        Delivered
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/order/${order.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Details
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {orders.data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No orders found.
            </p>
          </div>
        )}

        {orders.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              page={Number(page) || 1}
              totalPages={orders?.totalPages}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersPage;
