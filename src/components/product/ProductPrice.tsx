import {
  calculateDiscountPrice,
  cn,
  formatCurrency,
} from "@/lib/utils";

const ProductPrice = ({
  value,
  discountPercent,
  className,
}: {
  value: number;
  discountPercent?: number;
  className?: string;
}) => {
  const discountedPrice =
    discountPercent && discountPercent > 0
      ? value - (value * discountPercent) / 100
      : 0;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
    >
      {discountPercent ? (
        <>
          <span className="font-medium text-red-600">
            {formatCurrency(
              calculateDiscountPrice(discountedPrice)
            )}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(value)}
          </span>
        </>
      ) : (
        <span className="font-medium">
          {formatCurrency(value)}
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
