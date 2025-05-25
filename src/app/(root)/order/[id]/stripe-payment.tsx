import { FormEvent, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";
import { CreditCard } from "lucide-react";

const StripePayment = ({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );
  const { theme, systemTheme } = useTheme();

  // Stripe Form Component
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Pre-fill the form when elements are ready
    useEffect(() => {
      if (!elements) return;

      const paymentElement = elements.getElement("payment");
      if (paymentElement) {
        // Auto-fill the test card data
        setTimeout(() => {
          paymentElement.update({
            defaultValues: {
              billingDetails: {
                email: "admin@example.com",
              },
            },
          });
        }, 100);
      }
    }, [elements]);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (stripe == null || elements == null) return;
      setIsLoading(true);
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(
              error?.message ?? "An unknown error occurred"
            );
          } else if (error) {
            setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <div className="space-y-6">
        {/* Demo Instructions */}
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                🧪 Demo Payment Form
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Test Card:</strong> 4242 4242 4242
                4242
              </p>
              <p>
                <strong>Expiry:</strong> Any future date
                (e.g., 12/30)
              </p>
              <p>
                <strong>CVC:</strong> Any 3 digits (e.g.,
                123)
              </p>
              <p>
                <strong>Email:</strong> Pre-filled with
                admin@example.com
              </p>
            </div>
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              💡 This card number always succeeds for
              testing purposes
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="text-xl font-semibold">
            Complete Payment
          </div>
          {errorMessage && (
            <div className="text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              {errorMessage}
            </div>
          )}
          <PaymentElement
            options={{
              defaultValues: {
                billingDetails: {
                  email: "admin@example.com",
                },
              },
            }}
          />
          <div>
            <LinkAuthenticationElement
              options={{
                defaultValues: {
                  email: "admin@example.com",
                },
              }}
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={
              stripe == null ||
              elements == null ||
              isLoading
            }
          >
            {isLoading
              ? "Processing Payment..."
              : `Pay ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme:
            theme === "dark"
              ? "night"
              : theme === "light"
                ? "stripe"
                : systemTheme === "light"
                  ? "stripe"
                  : "night",
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
