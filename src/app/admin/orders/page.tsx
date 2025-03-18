import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteOrder,
  getAllOrders,
} from "@/lib/actions/order";
import {
  formatCurrency,
  formatDateTime,
  formatId,
} from "@/lib/utils";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import DeleteDialog from "@/components/delete-dialog";
import { requireAdmin } from "@/lib/auth-guard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  const { page = "1", query: searchText } =
    await props.searchParams;

  await requireAdmin();

  const orders = await getAllOrders({
    page: Number(page),
    query: searchText,
  });

  return (
    <Card className="border border-border shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Orders
            </CardTitle>
          </div>
        </div>
        {searchText && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filtered by{" "}
              <span className="font-medium">
                {searchText}
              </span>
            </span>
            <Link href="/admin/orders">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
              >
                Clear
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="rounded-md border-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-medium">
                  ID
                </TableHead>
                <TableHead className="font-medium">
                  DATE
                </TableHead>
                <TableHead className="font-medium">
                  BUYER
                </TableHead>
                <TableHead className="font-medium">
                  TOTAL
                </TableHead>
                <TableHead className="font-medium">
                  PAID
                </TableHead>
                <TableHead className="font-medium">
                  DELIVERED
                </TableHead>
                <TableHead className="font-medium w-[140px]">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(order.id)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {
                      formatDateTime(order.createdAt)
                        .dateTime
                    }
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.user.name}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {formatCurrency(
                      Number(order.totalPrice)
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
                      >
                        {
                          formatDateTime(order.paidAt)
                            .dateTime
                        }
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20"
                      >
                        Not Paid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered &&
                    order.deliveredAt ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400 border-green-500/20"
                      >
                        {
                          formatDateTime(order.deliveredAt)
                            .dateTime
                        }
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20"
                      >
                        Not Delivered
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                      >
                        <Link href={`/order/${order.id}`}>
                          Details
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={order.id}
                        action={deleteOrder}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {orders.totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        </div>
      )}
    </Card>
  );
};

export default AdminOrdersPage;
