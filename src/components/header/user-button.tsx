import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, UserIcon } from "lucide-react";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user";

const UserButton = async () => {
  const session = await auth();

  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon /> Sign In
        </Link>
      </Button>
    );
  }

  const firstInitial =
    session.user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="flex gap-2 items-center">
      {session ? (
        // Logged in state
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="relative w-8 h-8 rounded-full flex items-center justify-center bg-primary/10"
              >
                {firstInitial}
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium leading-none">
                  {session.user?.name}
                </div>
                <div className="text-xs text-muted-foreground leading-none">
                  {session.user?.email}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem>
              <Link href="/user/profile" className="w-full">
                User Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/user/orders" className="w-full">
                Order History
              </Link>
            </DropdownMenuItem>

            {session?.user?.role === "admin" && (
              <DropdownMenuItem>
                <Link
                  href="/admin/overview"
                  className="w-full"
                >
                  Admin
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>
              <form action={signOutUser}>
                <Button
                  type="submit"
                  className="w-full py-4 px-2 h-4 justify-start"
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Not logged in state
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <Link href="/login">
            <User className="h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default UserButton;
