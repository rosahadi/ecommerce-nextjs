import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ShoppingCart } from "lucide-react";
import UserButton from "./user-button";
import Search from "./search";
import ModeToggle from "./mode-toggle";
import MenuWrapper from "./MenuWrapper";

const Header = () => {
  const categories = [
    { value: "all", label: "All" },
    { value: "Tops", label: "Tops", count: 3 },
    { value: "Dresses", label: "Dresses", count: 2 },
  ];

  return (
    <header className="w-full border-b bg-background shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl md:text-2xl text-primary">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <div className="flex items-center space-x-4">
              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    Categories
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48"
                >
                  <DropdownMenuLabel>
                    Shop By Category
                  </DropdownMenuLabel>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.value}
                      asChild
                    >
                      <Link
                        className="w-full flex justify-between"
                        href={`/search?category=${category.value}`}
                      >
                        <span>{category.label}</span>
                        {category.count && (
                          <span className="text-xs text-muted-foreground">
                            ({category.count})
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search */}
              <div className="flex-1">
                <Search />
              </div>
            </div>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            <UserButton />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 bg-primary/5 hover:bg-primary/10"
            >
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                <span>Cart (0)</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <MenuWrapper />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-2">
          <Search />
        </div>
      </div>
    </header>
  );
};

export default Header;
