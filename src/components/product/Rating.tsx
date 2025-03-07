import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

const Rating = ({
  value,
  caption,
  className,
}: {
  value: number;
  caption?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
    >
      <div className="flex">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span key={rating}>
            {value >= rating ? (
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : value >= rating - 0.5 ? (
              <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <Star className="w-4 h-4 text-muted-foreground" />
            )}
          </span>
        ))}
      </div>

      {caption && (
        <span className="text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </div>
  );
};

export default Rating;
