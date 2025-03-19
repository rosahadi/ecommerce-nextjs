"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import ModeToggle from "./mode-toggle";
import CartButton from "./CartButton";
import { Category } from "@/types";

const Menu = ({
  userButton,
  categories,
}: {
  userButton: React.ReactNode;
  categories: Category[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-6">
        <h2 className="text-lg font-semibold">Menu</h2>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {userButton}
            <CartButton />
          </div>
          <div className="py-2 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  asChild
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <Link
                    href={`/search?category=${category.value}`}
                  >
                    <span>{category.label}</span>
                    {category.count && (
                      <span className="text-xs text-muted-foreground">
                        ({category.count})
                      </span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t flex items-center justify-between">
            <ModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Menu;
