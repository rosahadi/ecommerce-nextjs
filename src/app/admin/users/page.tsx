import { Metadata } from "next";
import {
  getAllUsers,
  deleteUser,
} from "@/lib/actions/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/DeleteDialog";
import { requireAdmin } from "@/lib/auth-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminUserPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  const { page = "1", query: searchText } =
    await props.searchParams;

  const users = await getAllUsers({
    page: Number(page),
    query: searchText,
  });

  return (
    <Card className="border border-border shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              Users
            </CardTitle>
          </div>
        </div>
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
                <TableHead className="font-medium">
                  EMAIL
                </TableHead>
                <TableHead className="font-medium">
                  ROLE
                </TableHead>
                <TableHead className="font-medium w-[140px]">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(user.id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {user.role === "user" ? (
                      <Badge
                        variant="outline"
                        className="bg-secondary/20 text-secondary-foreground border-secondary/30"
                      >
                        User
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-primary/20 text-primary-foreground border-primary/30 font-medium"
                      >
                        Admin
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
                        <Link
                          href={`/admin/users/${user.id}`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={user.id}
                        action={deleteUser}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {users.totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            page={Number(page) || 1}
            totalPages={users?.totalPages}
          />
        </div>
      )}
    </Card>
  );
};

export default AdminUserPage;
