"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { Size } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  size: z.string().min(1, "Please select a size"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1"),
});

type FormData = z.infer<typeof schema>;

const AddToCartClient = ({
  item,
  addToCartAction,
}: {
  item: CartItem;
  addToCartAction: (
    cartItem: CartItem
  ) => Promise<{ success: boolean; message: string }>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      size: "",
      quantity: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (item.stock < 1) {
      toast.error("Out of Stock", {
        description:
          "This product is currently out of stock.",
      });
      return;
    }

    if (item.stock < data.quantity) {
      toast.error("Insufficient Stock", {
        description: `Only ${item.stock} items available in stock.`,
      });
      return;
    }

    const cartItem = {
      ...item,
      size: [data.size as Size],
      quantity: data.quantity,
    };

    try {
      setIsSubmitting(true);
      const result = await addToCartAction(cartItem);

      if (result.success) {
        toast.success("Added to Cart", {
          description:
            result.message ||
            "Item has been added successfully.",
        });
        setIsDialogOpen(false);
        reset();
      } else {
        toast.error("Failed to Add Item", {
          description:
            result.message ||
            "There was an error adding the item to cart.",
        });
      }
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    >
      <DialogTrigger asChild>
        <Button>Add to Cart</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Select Size and Quantity
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <Label>Size</Label>
            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.size?.map((s: Size) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.size && (
              <p className="text-red-500">
                {errors.size.message}
              </p>
            )}
          </div>
          <div>
            <Label>Quantity</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="1"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(Number(e.target.value))
                  }
                />
              )}
            />
            {errors.quantity && (
              <p className="text-red-500">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={item.stock < 1 || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add to Cart"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartClient;
