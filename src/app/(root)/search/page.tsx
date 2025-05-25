import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, X, SlidersHorizontal } from "lucide-react";
import {
  getAllProducts,
  getAllCategories,
} from "@/lib/actions/product";
import Link from "next/link";
import { Category } from "@/types";
import Pagination from "@/components/Pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { targetAudiences } from "@/lib/constants";

const PAGE_SIZE = 4;

const prices = [
  { name: "$1 to $50", value: "1-50" },
  { name: "$51 to $100", value: "51-100" },
  { name: "$101 to $200", value: "101-200" },
  { name: "$201 to $500", value: "201-500" },
];

const ratings = [4, 3, 2, 1];

const sortOrders = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "lowest" },
  { label: "Price: High to Low", value: "highest" },
  { label: "Top Rated", value: "rating" },
];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    audience?: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    audience = "all",
  } = await props.searchParams;

  const isAudienceSet =
    audience &&
    audience !== "all" &&
    audience.trim() !== "";

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category &&
    category !== "all" &&
    category.trim() !== "";
  const isPriceSet =
    price && price !== "all" && price.trim() !== "";
  const isRatingSet =
    rating && rating !== "all" && rating.trim() !== "";

  if (
    isQuerySet ||
    isCategorySet ||
    isPriceSet ||
    isRatingSet ||
    isAudienceSet
  ) {
    return {
      title: `Search ${isQuerySet ? q : ""} 
        ${isCategorySet ? `: Category ${category}` : ""}
        ${isPriceSet ? `: Price ${price}` : ""}
        ${isRatingSet ? `: Rating ${rating}` : ""}
        ${isAudienceSet ? `: For ${audience}` : ""}`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    audience?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    audience = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  // Construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    a,
    pg,
    q: qParam,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    a?: string;
    pg?: string;
    q?: string;
  }) => {
    const params: Record<string, string> = {
      q,
      category,
      price,
      rating,
      audience,
      sort,
      page,
    };

    if (c) params.category = c;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (r) params.rating = r;
    if (a) params.audience = a;
    if (pg) params.page = pg;
    if (qParam) params.q = qParam;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    audience,
    page: Number(page),
    limit: PAGE_SIZE,
  });

  const categoriesData = await getAllCategories();

  const categories: Category[] = [
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

  // Count active filters
  const activeFiltersCount =
    (q !== "all" && q !== "" ? 1 : 0) +
    (category !== "all" && category !== "" ? 1 : 0) +
    (price !== "all" ? 1 : 0) +
    (rating !== "all" ? 1 : 0) +
    (audience !== "all" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile Header with Sheet Dialog */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Shop Collection
          </h1>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters{" "}
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md p-4"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)] pr-4">
                <div className="py-4 space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          category === "all" ||
                          category === ""
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      ></Button>
                      {categories.map((x) => (
                        <Button
                          key={x.value}
                          variant={
                            category === x.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              c: x.value,
                            })}
                          >
                            {x.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Separator />

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Gender
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          audience === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ a: "all" })}
                        >
                          All
                        </Link>
                      </Button>
                      {targetAudiences.map((a) => (
                        <Button
                          key={a.value}
                          variant={
                            audience === a.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              a: a.value,
                            })}
                          >
                            {a.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Price Range
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          price === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ p: "all" })}
                        >
                          Any Price
                        </Link>
                      </Button>
                      {prices.map((p) => (
                        <Button
                          key={p.value}
                          variant={
                            price === p.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              p: p.value,
                            })}
                          >
                            {p.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Customer Rating
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          rating === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ r: "all" })}
                        >
                          Any Rating
                        </Link>
                      </Button>
                      {ratings.map((r) => (
                        <Button
                          key={r}
                          variant={
                            rating === r.toString()
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              r: `${r}`,
                            })}
                          >
                            <div className="flex items-center">
                              {Array.from({
                                length: r,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-current"
                                />
                              ))}
                              <span className="ml-1">
                                & up
                              </span>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <Link href="/search">
                          Clear all filters
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="sticky top-24">
            <ScrollArea className="h-[calc(100vh-150px)]">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {categories.map((x) => (
                        <Button
                          key={x.value}
                          variant={
                            category === x.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              c: x.value,
                            })}
                          >
                            {x.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Separator />

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Gender
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          audience === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ a: "all" })}
                        >
                          All
                        </Link>
                      </Button>
                      {targetAudiences.map((a) => (
                        <Button
                          key={a.value}
                          variant={
                            audience === a.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              a: a.value,
                            })}
                          >
                            {a.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Price Range
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          price === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ p: "all" })}
                        >
                          Any Price
                        </Link>
                      </Button>
                      {prices.map((p) => (
                        <Button
                          key={p.value}
                          variant={
                            price === p.value
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              p: p.value,
                            })}
                          >
                            {p.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-lg mb-3">
                      Customer Rating
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          rating === "all"
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={getFilterUrl({ r: "all" })}
                        >
                          Any Rating
                        </Link>
                      </Button>
                      {ratings.map((r) => (
                        <Button
                          key={r}
                          variant={
                            rating === r.toString()
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <Link
                            href={getFilterUrl({
                              r: `${r}`,
                            })}
                          >
                            <div className="flex items-center">
                              {Array.from({
                                length: r,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-current"
                                />
                              ))}
                              <span className="ml-1">
                                & up
                              </span>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters & Sort */}
          <div className="bg-muted/40 rounded-lg p-4 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Active Filters Section  */}
              {activeFiltersCount > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {q !== "all" && q !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Search: {q}
                        <Link
                          href={getFilterUrl({ q: "all" })}
                        >
                          <X className="h-3 w-3 ml-1" />
                        </Link>
                      </Badge>
                    )}
                    {category !== "all" &&
                      category !== "" && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {category}
                          <Link
                            href={getFilterUrl({
                              c: "all",
                            })}
                          >
                            <X className="h-3 w-3 ml-1" />
                          </Link>
                        </Badge>
                      )}

                    {audience !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {targetAudiences.find(
                          (a) => a.value === audience
                        )?.label || audience}
                        <Link
                          href={getFilterUrl({ a: "all" })}
                        >
                          <X className="h-3 w-3 ml-1" />
                        </Link>
                      </Badge>
                    )}

                    {price !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {prices.find(
                          (p) => p.value === price
                        )?.name || price}
                        <Link
                          href={getFilterUrl({ p: "all" })}
                        >
                          <X className="h-3 w-3 ml-1" />
                        </Link>
                      </Badge>
                    )}
                    {rating !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {rating}+ stars
                        <Link
                          href={getFilterUrl({ r: "all" })}
                        >
                          <X className="h-3 w-3 ml-1" />
                        </Link>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-7"
                    >
                      <Link href="/search">Clear all</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No filters applied
                </span>
              )}

              {/* Sort Section with Horizontal Scroll on Small Screens */}
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">
                  Sort by:
                </span>
                <div className="overflow-x-auto pb-1 flex gap-4 no-scrollbar">
                  {sortOrders.map((option) => (
                    <Link
                      key={option.value}
                      href={getFilterUrl({
                        s: option.value,
                      })}
                      className={`text-sm whitespace-nowrap ${
                        sort === option.value
                          ? "font-bold"
                          : ""
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {products.data.length === 0
                ? "No products found"
                : `Showing ${products.data.length} ${
                    products.data.length === 1
                      ? "product"
                      : "products"
                  }`}
            </p>
          </div>

          {/* Product Grid */}
          {products.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <X className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                No products found
              </h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button asChild>
                <Link href="/search">Reset filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {products.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                page={page}
                totalPages={products.totalPages}
                urlParamName="page"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
