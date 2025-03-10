import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/actions/product";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/product/ProductPrice";
import ProductImages from "@/components/product/ProductImages";
import Rating from "@/components/product/Rating";
import AddToCart from "@/components/product/AddToCart";
import { Truck, RefreshCw } from "lucide-react";
import { Size } from "@prisma/client";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <nav className="text-sm breadcrumbs">
          <span className="text-muted-foreground">
            Home
          </span>{" "}
          /{" "}
          <span className="text-muted-foreground">
            {product.category[0]}
          </span>{" "}
          / <span>{product.name}</span>
        </nav>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* Images Column  */}
        <div className="lg:col-span-5">
          <ProductImages images={product.images} />
        </div>

        {/* Details Column */}
        <div className="lg:col-span-4">
          <div className="space-y-4">
            {/* Product Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isNew && (
                <Badge className="bg-primary text-primary-foreground">
                  New
                </Badge>
              )}
              {product.bestSeller && (
                <Badge className="bg-amber-500 text-white">
                  Best Seller
                </Badge>
              )}
              {product.discountPercent && (
                <Badge className="bg-red-500 text-white">
                  -{product.discountPercent}%
                </Badge>
              )}
            </div>

            {/* Category & Target Audience */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{product.category.join(", ")}</span>
              <span>•</span>
              <span>
                {product.targetAudience === "MEN"
                  ? "Men's"
                  : "Women's"}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl font-bold md:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Rating value={Number(product.rating)} />
              <span className="text-sm text-muted-foreground">
                ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <ProductPrice
                value={Number(product.price)}
                salePrice={
                  product.salePrice
                    ? Number(product.salePrice)
                    : undefined
                }
                className="text-xl"
              />
            </div>

            {/* Color & Material */}
            {(product.color || product.material) && (
              <div className="grid grid-cols-2 gap-4">
                {product.color && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Color
                    </p>
                    <p>{product.color}</p>
                  </div>
                )}
                {product.material && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Material
                    </p>
                    <p>{product.material}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sizes */}
            {product.size && product.size.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Available Sizes
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((size) => (
                    <Badge
                      key={size}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-sm">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Column */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Status
                </span>
                <Badge
                  variant={
                    product.status === "OUT_OF_STOCK"
                      ? "destructive"
                      : "outline"
                  }
                  className={
                    product.status === "IN_STOCK"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : ""
                  }
                >
                  {product.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Price
                </span>
                <ProductPrice
                  value={Number(product.price)}
                  salePrice={
                    product.salePrice
                      ? Number(product.salePrice)
                      : undefined
                  }
                />
              </div>

              {/* Stock */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Availability
                </span>
                <span
                  className={
                    product.stock > 10
                      ? "text-green-600"
                      : product.stock > 0
                        ? "text-amber-600"
                        : "text-red-600"
                  }
                >
                  {product.stock > 10
                    ? "In Stock"
                    : product.stock > 0
                      ? `Only ${product.stock} left`
                      : "Out of Stock"}
                </span>
              </div>

              {/* Add to Cart Button */}
              {product.stock > 0 ? (
                <div className="pt-2">
                  <AddToCart
                    item={{
                      productId: product.id,
                      stock: product.stock,
                      size: product.size as Size[],
                      price: Number(product.price),
                      color: product.color,
                      name: product.name,
                      slug: product.slug,
                      image: product.images[0] || "",
                    }}
                  />
                </div>
              ) : (
                <Button disabled className="w-full">
                  Out of Stock
                </Button>
              )}

              {/* Shipping Details */}
              <div className="pt-4 space-y-3 text-sm border-t">
                <div className="flex items-center gap-2">
                  <Truck
                    size={16}
                    className="text-muted-foreground"
                  />
                  <span>
                    Free shipping on orders over $50
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw
                    size={16}
                    className="text-muted-foreground"
                  />
                  <span>30-day easy returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">
          Customer Reviews
        </h2>
        review list
      </section>
    </div>
  );
};

export default ProductDetailsPage;
