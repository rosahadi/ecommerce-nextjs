import { cn } from "@/lib/utils";

const ProductPrice = ({
  value,
  salePrice,
  className,
}: {
  value: number;
  salePrice?: number;
  className?: string;
}) => {
  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
    >
      {salePrice ? (
        <>
          <span className="font-medium text-red-600">
            {formatPrice(salePrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(value)}
          </span>
        </>
      ) : (
        <span className="font-medium">
          {formatPrice(value)}
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
