import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ProductPrice from "./ProductPrice";
import Rating from "./Rating";
import { Product, Size } from "@prisma/client";
import AddToCart from "./AddToCart";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="group overflow-hidden rounded-lg border transition-all hover:shadow-md">
      <div className="relative aspect-[2/2.4] w-full">
        <Link
          href={`/product/${product.slug}`}
          className="block h-full w-full"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={true}
          />

          {/* Product badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.isNew && (
              <Badge
                variant="default"
                className="font-medium"
              >
                New
              </Badge>
            )}
            {product.bestSeller && (
              <Badge className="bg-amber-500 text-white font-medium">
                Best Seller
              </Badge>
            )}
            {product.discountPercent && (
              <Badge className="bg-red-500 text-white font-medium">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>

          {/* Status badge */}
          {product.status !== "IN_STOCK" && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant={
                  product.status === "OUT_OF_STOCK"
                    ? "destructive"
                    : "secondary"
                }
                className="font-medium"
              >
                {product.status.replace("_", " ")}
              </Badge>
            </div>
          )}
        </Link>
      </div>

      <CardContent className="p-4 pt-4 space-y-2">
        {/* Product name */}
        <Link
          href={`/product/${product.slug}`}
          className="block"
        >
          <h3 className="font-medium line-clamp-2 hover:underline text-foreground">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <Rating
          value={Number(product.rating)}
          caption={`${product.numReviews} reviews`}
        />
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* Price */}
        <ProductPrice
          value={Number(product.price)}
          discountPercent={
            product.discountPercent || undefined
          }
        />

        {/* Add to cart (only if in stock) */}
        {product.stock > 0 && (
          <AddToCart
            item={{
              id: product.id,
              stock: product.stock,
              size: product.size as Size[],
              price: Number(product.price),
              color: product.color,
              name: product.name,
              slug: product.slug,
              images: [product.images[0] || ""],
            }}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
