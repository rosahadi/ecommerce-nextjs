import Link from "next/link";
import {
  getAllProducts,
  deleteProduct,
} from "@/lib/actions/product";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/Pagination";
import DeleteDialog from "@/components/DeleteDialog";
import { requireAdmin } from "@/lib/auth-guard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <Card className="border border-border shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Products
            </CardTitle>
          </div>
          <Button
            asChild
            variant="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link
              href="/admin/products/create"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Product</span>
            </Link>
          </Button>
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
            <Link href="/admin/products">
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
                  NAME
                </TableHead>
                <TableHead className="font-medium text-right">
                  PRICE
                </TableHead>
                <TableHead className="font-medium">
                  CATEGORY
                </TableHead>
                <TableHead className="font-medium">
                  STOCK
                </TableHead>
                <TableHead className="font-medium">
                  RATING
                </TableHead>
                <TableHead className="w-[120px] font-medium">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(product.id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(Number(product.price))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-secondary/30 text-secondary-foreground font-normal"
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.stock > 10 ? (
                      <span className="text-green-500 dark:text-green-400">
                        {product.stock}
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="text-amber-500 dark:text-amber-400">
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-destructive">
                        {product.stock}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span
                        className={`${Number(product.rating) >= 4 ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}
                      >
                        {Number(product.rating).toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                      >
                        <Link
                          href={`/admin/products/${product.id}`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={product.id}
                        action={deleteProduct}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {products.totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            page={page}
            totalPages={products.totalPages}
          />
        </div>
      )}
    </Card>
  );
};

export default AdminProductsPage;
