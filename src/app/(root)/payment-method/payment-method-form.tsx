"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { paymentMethodSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Loader,
  CreditCard,
} from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user";
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHODS,
} from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PaymentMethod } from "@prisma/client";
import { toast } from "sonner";

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const router = useRouter();

  // Convert string to enum value
  const getPaymentMethodFromString = (
    value: string | null
  ): PaymentMethod => {
    if (!value) return DEFAULT_PAYMENT_METHOD;

    // Check if the value is a valid PaymentMethod
    if (
      Object.values(PaymentMethod).includes(
        value as PaymentMethod
      )
    ) {
      return value as PaymentMethod;
    }

    return DEFAULT_PAYMENT_METHOD;
  };

  const form = useForm<z.infer<typeof paymentMethodSchema>>(
    {
      resolver: zodResolver(paymentMethodSchema),
      defaultValues: {
        type: getPaymentMethodFromString(
          preferredPaymentMethod
        ),
      },
    }
  );

  const [isPending, startTransition] = useTransition();

  const onSubmit = async (
    values: z.infer<typeof paymentMethodSchema>
  ) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast("", {
          description: res.message,
        });
        return;
      }

      router.push("/place-order");
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Payment Method</CardTitle>
          </div>
          <CardDescription>
            Select how you&apos;d like to pay for your order
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              method="post"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Options</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-2"
                      >
                        {PAYMENT_METHODS.map(
                          (paymentMethod) => (
                            <FormItem
                              key={paymentMethod}
                              className="flex items-center space-x-3 space-y-0 border rounded-md p-3 hover:border-primary transition-all"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={paymentMethod}
                                  checked={
                                    field.value ===
                                    paymentMethod
                                  }
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full">
                                {paymentMethod.replace(
                                  /_/g,
                                  " "
                                )}
                              </FormLabel>
                            </FormItem>
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Continue to Place Order
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodForm;
