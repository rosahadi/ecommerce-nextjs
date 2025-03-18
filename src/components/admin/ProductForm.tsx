"use client";

import { productDefaultValues } from "@/lib/constants";
import {
  insertProductSchema,
  updateProductSchema,
} from "@/lib/schema";
import { InsertProduct, UpdateProduct } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  createProduct,
  updateProduct,
} from "@/lib/actions/product";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Size,
  ProductStatus,
  TargetAudience,
} from "@prisma/client";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: UpdateProduct;
  productId?: string;
}) => {
  const router = useRouter();

  const form = useForm<InsertProduct | UpdateProduct>({
    resolver: zodResolver(
      type === "Create"
        ? insertProductSchema
        : updateProductSchema
    ),
    defaultValues:
      type === "Create" ? productDefaultValues : product,
  });

  const onSubmit: SubmitHandler<
    InsertProduct | UpdateProduct
  > = async (values) => {
    console.log("Form submission started", values);
    try {
      // Transform data before submission
      const transformedValues = {
        ...values,
        price:
          typeof values.price === "string"
            ? parseFloat(values.price)
            : values.price,
        stock:
          typeof values.stock === "string"
            ? parseInt(values.stock, 10)
            : values.stock,
        discountPercent:
          values.discountPercent === null ||
          values.discountPercent === undefined
            ? null
            : typeof values.discountPercent === "string"
              ? parseInt(values.discountPercent, 10)
              : values.discountPercent,
      };

      console.log("Transformed values", transformedValues);

      if (type === "Update" && productId) {
        console.log("Attempting to update product");
        const updatedValues = {
          ...transformedValues,
          id: productId,
        };

        const res = await updateProduct(
          updatedValues as UpdateProduct
        );
        console.log("Update response", res);

        if (!res.success) {
          toast("Error", { description: res.message });
        } else {
          toast("Success", { description: res.message });
          router.push("/admin/products");
        }
      } else if (type === "Create") {
        console.log("Attempting to create product");
        const res = await createProduct(
          transformedValues as InsertProduct
        );
        console.log("Create response", res);
        if (!res.success) {
          toast("Error", { description: res.message });
        } else {
          toast("Success", { description: res.message });
          router.push("/admin/products");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast("Error", {
        description: "An unexpected error occurred.",
      });
    }
  };

  // Use type assertion for typesafe watches and field values
  const images = form.watch("images") as string[];
  const name = form.watch("name") as string;

  const sizeOptions = [
    { label: "XXS", value: "XXS" },
    { label: "XS", value: "XS" },
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
    { label: "XL", value: "XL" },
    { label: "XXL", value: "XXL" },
    { label: "XXXL", value: "XXXL" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="basic">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details">
                Details
              </TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent
              value="basic"
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Input
                            placeholder="Enter slug"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (name) {
                                form.setValue(
                                  "slug",
                                  slugify(name, {
                                    lower: true,
                                  })
                                );
                              }
                            }}
                          >
                            Generate
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        This will be used in the product URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter categories (comma separated)"
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : ""
                          }
                          onChange={(e) => {
                            const inputValue =
                              e.target.value;
                            const categories = inputValue
                              .split(",")
                              .map((item) => item.trim())
                              .filter(
                                (item) => item !== ""
                              );
                            field.onChange(categories);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate multiple categories with
                        commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Target Audience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={
                          field.value as TargetAudience
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MEN">
                            Men
                          </SelectItem>
                          <SelectItem value="WOMEN">
                            Women
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : parseFloat(
                                    e.target.value
                                  );
                            field.onChange(value);
                          }}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : parseInt(
                                    e.target.value,
                                    10
                                  );
                            field.onChange(value);
                          }}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={
                          field.value as ProductStatus
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN_STOCK">
                            In Stock
                          </SelectItem>
                          <SelectItem value="LOW_STOCK">
                            Low Stock
                          </SelectItem>
                          <SelectItem value="OUT_OF_STOCK">
                            Out of Stock
                          </SelectItem>
                          <SelectItem value="DISCONTINUED">
                            Discontinued
                          </SelectItem>
                          <SelectItem value="PRE_ORDER">
                            Pre-Order
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="details"
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter color"
                          {...field}
                          value={
                            (field.value as string) || ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter material"
                          {...field}
                          value={
                            (field.value as string) || ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>Sizes</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {sizeOptions.map((size) => (
                    <FormField
                      key={size.value}
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem
                          key={size.value}
                          className="flex flex-row items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={(
                                field.value as Size[]
                              ).includes(
                                size.value as Size
                              )}
                              onCheckedChange={(
                                checked
                              ) => {
                                const currentSizes = [
                                  ...(field.value as Size[]),
                                ];
                                if (checked) {
                                  field.onChange([
                                    ...currentSizes,
                                    size.value as Size,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentSizes.filter(
                                      (s) =>
                                        s !== size.value
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {size.label}
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-row gap-6">
                <FormField
                  control={form.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Mark as New</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bestSeller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Best Seller</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Discount Percentage
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={
                            field.value === null
                              ? ""
                              : field.value
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseInt(
                                    e.target.value,
                                    10
                                  );
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a value between 0-100
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="media"
              className="space-y-6"
            >
              <div className="upload-field">
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem className="w-full">
                      <FormLabel>Images</FormLabel>
                      <Card>
                        <CardContent className="space-y-4 p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map(
                              (
                                image: string,
                                index: number
                              ) => (
                                <div
                                  key={image}
                                  className="relative group"
                                >
                                  <Image
                                    src={image}
                                    alt={`product image ${index + 1}`}
                                    className="w-full h-32 object-cover object-center rounded-md"
                                    width={150}
                                    height={150}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    onClick={() => {
                                      const updatedImages =
                                        [...images];
                                      updatedImages.splice(
                                        index,
                                        1
                                      );
                                      form.setValue(
                                        "images",
                                        updatedImages
                                      );
                                    }}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              )
                            )}
                          </div>

                          <div className="flex justify-center p-4 border-2 border-dashed border-zinc-600 rounded-md">
                            <FormControl>
                              <UploadButton
                                endpoint="imageUploader"
                                onClientUploadComplete={(
                                  res: { url: string }[]
                                ) => {
                                  console.log(
                                    "Upload completed",
                                    res
                                  );
                                  form.setValue("images", [
                                    ...images,
                                    res[0].url,
                                  ]);
                                  toast("Success", {
                                    description:
                                      "Image uploaded successfully",
                                  });
                                }}
                                onUploadError={(
                                  error: Error
                                ) => {
                                  console.error(
                                    "Upload error",
                                    error
                                  );
                                  toast("Error", {
                                    description: `Upload failed: ${error.message}`,
                                  });
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Upload high-quality images (min
                            800x800px recommended)
                          </FormDescription>
                        </CardContent>
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting
                ? "Submitting..."
                : `${type} Product`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
