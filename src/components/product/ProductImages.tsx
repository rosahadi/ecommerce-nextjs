"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({
  images,
}: {
  images: string[];
}) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative  aspect-[2/2.4] overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={images[current]}
          alt="Product image"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "relative  aspect-[2/2.4] overflow-hidden rounded-md cursor-pointer transition-all",
              current === index
                ? "ring-2 ring-black"
                : "ring-1 ring-gray-200 hover:ring-gray-300"
            )}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 20vw, 10vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
