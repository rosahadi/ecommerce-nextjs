import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrderSummary } from "@/lib/actions/order";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/utils";
import {
  BadgeDollarSign,
  Barcode,
  CreditCard,
  Users,
  ExternalLink,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Charts from "./charts";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Street Gear | Admin Dashboard",
};

const AdminOverviewPage = async () => {
  await requireAdmin();

  const summary = await getOrderSummary();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          DASHBOARD
        </h1>
        <span className="text-sm text-muted-foreground">
          Street Gear Admin
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Revenue
            </CardTitle>
            <BadgeDollarSign className="text-primary h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                summary.totalSales?.toString() || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Changed Orders card to use orange/amber color scheme */}
        <Card className="border-l-4 border-l-orange-500 dark:border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Orders
            </CardTitle>
            <CreditCard className="text-orange-500 dark:text-amber-500 h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(summary.ordersCount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +18 new today
            </p>
          </CardContent>
        </Card>

        {/* Changed Customers card to use purple/violet color scheme */}
        <Card className="border-l-4 border-l-purple-600 dark:border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Customers
            </CardTitle>
            <Users className="text-purple-600 dark:text-violet-500 h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(summary.usersCount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +7 new signups
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Products
            </CardTitle>
            <Barcode className="text-destructive h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(summary.productsCount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +3 out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-t-2 border-t-primary">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Charts
              data={{
                salesData: summary.salesData,
              }}
            />
          </CardContent>
        </Card>

        {/* Updated the Latest Drops card to match the Orders color */}
        <Card className="col-span-3 border-t-2 border-t-orange-500 dark:border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Latest Drops
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-xs uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs uppercase">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs uppercase w-16">
                    View
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {order?.user?.name
                        ? order.user.name
                        : "Anonymous"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {
                        formatDateTime(order.createdAt)
                          .dateOnly
                      }
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(
                        Number(order.totalPrice)
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/order/${order.id}`}
                        className="flex items-center text-orange-500 dark:text-amber-500 text-sm hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
