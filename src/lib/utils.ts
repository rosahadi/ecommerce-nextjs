import { CartItem } from "@/types";
import { Size } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import qs from "query-string";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with decimal places
export function formatNumberWithDecimal(
  num: number
): string {
  const [int, decimal] = num.toString().split(".");
  return decimal
    ? `${int}.${decimal.padEnd(2, "0")}`
    : `${int}.00`;
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // Handle Prisma error
    const field = error.meta?.target
      ? error.meta.target[0]
      : "Field";
    return `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return (
      Math.round((Number(value) + Number.EPSILON) * 100) /
      100
    );
  } else {
    throw new Error("Value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});
export function formatCurrency(
  amount: number | string | null
) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

export const calculateDiscountPrice = (
  price: number,
  discountPercent?: number | null
): number => {
  if (!discountPercent) return price;

  const discount = (discountPercent / 100) * price;
  return Number((price - discount).toFixed(2));
};

export const calcPriceWithDiscounts = (
  items: CartItem[]
) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => {
      const priceToUse =
        item.discountedPrice !== undefined
          ? item.discountedPrice
          : item.price || 0;
      return acc + priceToUse * (item.quantity || 1);
    }, 0)
  );

  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(
    itemsPrice + taxPrice + shippingPrice
  );

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

export const normalizeSize = (
  size: Size | Size[] | string | null | undefined
): Size | undefined => {
  if (Array.isArray(size) && size.length > 0)
    return size[0] as Size;
  if (size && typeof size === "string") return size as Size;
  return size as Size | undefined;
};

// Shorten UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const formattedDateTime: string = format(
    dateString,
    "MMM d, yyyy h:mm a"
  );
  const formattedDate: string = format(
    dateString,
    "EEE, MMM d, yyyy"
  );
  const formattedTime: string = format(
    dateString,
    "h:mm a"
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}
