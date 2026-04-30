import * as React from "react"
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "react-email"

interface OrderItem {
  name: string
  quantity: number
  price: string
}

interface OrderProcessingEmailProps {
  orderCode: string
  customerName: string
  trackOrderUrl: string
  items?: OrderItem[]
  totalPrice?: string
  paymentMethod?: string
}

export const OrderProcessingEmail = ({
  orderCode,
  customerName,
  trackOrderUrl,
  items,
  totalPrice,
  paymentMethod,
}: OrderProcessingEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderCode} is being processed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>We&apos;re working on it!</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Good news — your order <strong>{orderCode}</strong> is now being processed by our team. 
            We&apos;re getting everything ready for delivery.
          </Text>

          {items && items.length > 0 ? (
            <Section style={receiptSection}>
              <Text style={receiptHeading}>Order Summary</Text>
              <Hr style={divider} />
              {items.map((item, index) => (
                <Text key={index} style={itemLine}>
                  {item.name} × {item.quantity} — {item.price}
                </Text>
              ))}
              <Hr style={divider} />
              {totalPrice ? <Text style={totalLine}>Total: {totalPrice}</Text> : null}
              {paymentMethod ? <Text style={metaLine}>Payment: {paymentMethod}</Text> : null}
            </Section>
          ) : null}
          
          <Section style={btnContainer}>
            <Link href={trackOrderUrl} style={button}>
              Track Your Order
            </Link>
          </Section>

          <Text style={paragraph}>
            If you have any questions, you can reply directly to this email.
          </Text>
          <Text style={footer}>
            Wong Digital Shop Philippines
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
}

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#18181b",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3f3f46",
}

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
}

const button = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
}

const footer = {
  color: "#a1a1aa",
  fontSize: "14px",
  marginTop: "48px",
}

const receiptSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "16px 20px",
  marginTop: "24px",
  marginBottom: "24px",
}

const receiptHeading = {
  fontSize: "13px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#71717a",
  margin: "0 0 8px 0",
}

const divider = {
  borderColor: "#e4e4e7",
  margin: "12px 0",
}

const itemLine = {
  fontSize: "14px",
  color: "#3f3f46",
  margin: "4px 0",
}

const totalLine = {
  fontSize: "15px",
  fontWeight: "700" as const,
  color: "#18181b",
  margin: "4px 0",
}

const metaLine = {
  fontSize: "13px",
  color: "#71717a",
  margin: "2px 0",
}
