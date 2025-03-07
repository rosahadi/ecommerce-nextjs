"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, SearchIcon } from "lucide-react";

interface Category {
  value: string;
  label: string;
  count?: number;
}

const categories: Category[] = [
  { value: "all", label: "All Categories" },
  { value: "Tops", label: "Tops", count: 3 },
  { value: "Dresses", label: "Dresses", count: 2 },
];

const Search = () => {
  const [searchQuery, setSearchQuery] =
    useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");
  const [isFiltersOpen, setIsFiltersOpen] =
    useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const toggleFilters = () =>
    setIsFiltersOpen((prev) => !prev);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsFiltersOpen(false);
  };

  return (
    <div
      className="relative w-full max-w-md"
      ref={searchRef}
    >
      <form
        action="/search"
        method="GET"
        className="flex items-center space-x-2"
      >
        <div className="relative w-full">
          <Input
            name="q"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() =>
              searchQuery && setIsFiltersOpen(true)
            }
            placeholder="Search products..."
            className="pr-16" // Space for icons
            required
          />

          {/* Hidden input to submit the category */}
          <input
            type="hidden"
            name="category"
            value={selectedCategory}
          />

          {/* Filter button */}
          <div className="absolute right-8 top-0 h-full flex items-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleFilters}
              className="h-full w-8 p-0"
            >
              <Filter className="h-4 w-4" />
              {selectedCategory !== "all" && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          </div>

          {/* Search button */}
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Category filter dropdown */}
      {isFiltersOpen && (
        <div className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-10">
          <div className="p-2">
            <h3 className="text-sm font-medium mb-2">
              Filter by Category
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category.value}
                  onClick={() =>
                    handleCategorySelect(category.value)
                  }
                  className={`px-2 py-1.5 rounded text-sm cursor-pointer flex justify-between items-center ${
                    selectedCategory === category.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span>{category.label}</span>
                  {category.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
