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
import { ChevronDown } from "lucide-react";
import UserButton from "./user-button";
import ModeToggle from "./mode-toggle";
import MenuWrapper from "./MenuWrapper";
import CartButton from "./CartButton";
import { getAllCategories } from "@/lib/actions/product";
import SearchWrapper from "./searchWrapper";

const Header = async () => {
  const categoriesData = await getAllCategories();

  const categories = [
    {
      value: "all",
      label: "All",
      count: categoriesData.length,
    },
    ...categoriesData.map((item) => ({
      value: item.category[0],
      label: item.category[0],
      count: item._count,
    })),
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
                        {category?.count && (
                          <span className="text-xs text-muted-foreground">
                            ({category?.count})
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search */}
              <div className="flex-1">
                <SearchWrapper categories={categories} />
              </div>
            </div>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            <UserButton />
            <CartButton />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <MenuWrapper categories={categories} />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-2">
          <SearchWrapper categories={categories} />
        </div>
      </div>
    </header>
  );
};

export default Header;
