import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { configDotenv } from "dotenv";
import { getProductById } from "@/lib/actions/product";
import {
  OrderStatus,
  PaymentMethod,
  Size,
} from "@prisma/client";

configDotenv();

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: "123",
    user: {
      name: "John Doe",
      email: "test@test.com",
    },
    paymentMethod: PaymentMethod.STRIPE,
    shippingAddress: {
      fullName: "John Doe",
      streetAddress: "123 Main st",
      city: "New York",
      postalCode: "10001",
      country: "US",
    },
    createdAt: new Date(),
    totalPrice: 100,
    taxPrice: 10,
    shippingPrice: 10,
    itemsPrice: 80,
    orderitems: [
      {
        id: crypto.randomUUID(),
        orderId: "123",
        productId: "123",
        quantity: 1,
        price: 80,
        name: "Sample Product",
        slug: "sample-product",
        image: "/images/sample.jpg",
        color: "Blue",
        size: Size.M,
      },
    ],
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    status: OrderStatus.DELIVERED,
    paymentResult: {
      id: "123",
      status: "succeeded",
      email_address: "test@test.com",
      pricePaid: "100",
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

type OrderInformationProps = {
  order: Order;
};

export default async function PurchaseReceiptEmail({
  order,
}: OrderInformationProps) {
  // Ensure all order items have current data
  const orderItemsWithProductData = await Promise.all(
    order.orderitems.map(async (item) => {
      // If the item already has all required data, use it directly
      if (item.name && item.slug && item.image) {
        return item;
      }

      // Otherwise, fetch the product to get missing data
      try {
        const product = await getProductById(
          item.productId
        );
        if (product) {
          return {
            ...item,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            color: item.color || product.color,
            size: item.size || product.size[0], // Get first size if not specified
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch product ${item.productId}:`,
          error
        );
      }

      // Fallback to item data if product fetch fails
      return item;
    })
  );

  console.log(orderItemsWithProductData);

  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">
                    {order.id.toString()}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {orderItemsWithProductData.map((item) => (
                <Row key={item.id} className="mt-8">
                  <Column className="w-20">
                    <Img
                      width="80"
                      alt={item.name}
                      className="rounded"
                      src={
                        item.image.startsWith("/")
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className="align-top">
                    <Text className="m-0 font-medium">
                      {item.name}
                    </Text>
                    <Text className="m-0 text-sm text-gray-500">
                      Qty: {item.quantity}
                      {item.color &&
                        ` • Color: ${item.color}`}
                      {item.size && ` • Size: ${item.size}`}
                    </Text>
                  </Column>
                  <Column
                    align="right"
                    className="align-top"
                  >
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              <Row className="mt-8 pt-4 border-t border-gray-300">
                {[
                  {
                    name: "Items",
                    price: order.itemsPrice,
                  },
                  { name: "Tax", price: order.taxPrice },
                  {
                    name: "Shipping",
                    price: order.shippingPrice,
                  },
                  {
                    name: "Total",
                    price: order.totalPrice,
                    isBold: true,
                  },
                ].map(({ name, price, isBold }) => (
                  <Row key={name} className="py-1">
                    <Column align="right">
                      <Text
                        className={
                          isBold ? "m-0 font-bold" : "m-0"
                        }
                      >
                        {name}:
                      </Text>
                    </Column>
                    <Column
                      align="right"
                      width={70}
                      className="align-top"
                    >
                      <Text
                        className={
                          isBold ? "m-0 font-bold" : "m-0"
                        }
                      >
                        {formatCurrency(price)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Row>
            </Section>
            <Section>
              <Text className="text-sm text-gray-600">
                Shipping Address:{" "}
                {order.shippingAddress.fullName},{" "}
                {order.shippingAddress.streetAddress},{" "}
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </Text>
              <Text className="text-sm text-gray-600">
                Payment Method: {order.paymentMethod}
              </Text>
              <Text className="text-sm text-gray-600">
                Order Status: {order.status}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
