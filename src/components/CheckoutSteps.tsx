import React from "react";
import { cn } from "@/lib/utils";

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-10">
      {[
        "Login",
        "Shipping Address",
        "Payment Method",
        "Place Order",
      ].map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              "p-3 w-48 rounded-xl text-center text-sm font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden",
              index === current
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg transform scale-105"
                : "bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:shadow-md"
            )}
          >
            {step}
          </div>
          {step !== "Place Order" && (
            <div className="hidden md:block w-12 h-1 bg-gradient-to-r from-muted/50 to-muted/20 rounded-full mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
