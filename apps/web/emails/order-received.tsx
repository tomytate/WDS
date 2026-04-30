import * as React from "react"
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "react-email"

interface OrderItem {
  name: string
  quantity: number
  price: string
}

interface OrderReceivedEmailProps {
  orderCode: string
  customerName: string
  items: OrderItem[]
  totalPrice: string
  paymentMethod: string
  trackOrderUrl: string
}

export const OrderReceivedEmail = ({
  orderCode,
  customerName,
  items,
  totalPrice,
  paymentMethod,
  trackOrderUrl,
}: OrderReceivedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Order {orderCode} confirmed — we received your payment!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandName}>Wong Digital Shop</Text>
          </Section>

          <Heading style={heading}>Payment Received ✅</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for your purchase! We have successfully received your payment and your order{" "}
            <strong>{orderCode}</strong> is now confirmed.
          </Text>

          {/* Receipt */}
          <Section style={receiptSection}>
            <Text style={receiptHeading}>Order Receipt</Text>
            <Hr style={divider} />

            {items.map((item, index) => (
              <Section key={index} style={receiptRow}>
                <Text style={itemName}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={itemPrice}>{item.price}</Text>
              </Section>
            ))}

            <Hr style={divider} />

            <Section style={receiptRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalValue}>{totalPrice}</Text>
            </Section>

            <Section style={receiptRow}>
              <Text style={metaLabel}>Payment Method</Text>
              <Text style={metaValue}>{paymentMethod}</Text>
            </Section>

            <Section style={receiptRow}>
              <Text style={metaLabel}>Order Code</Text>
              <Text style={metaValue}>{orderCode}</Text>
            </Section>
          </Section>

          {/* What happens next */}
          <Section style={nextStepsSection}>
            <Text style={nextStepsHeading}>What happens next?</Text>
            <Text style={nextStepsBody}>
              Your order is now in our queue. Our team will begin processing it shortly.
              You will receive another email once fulfillment begins. Most orders are
              fulfilled within 1–12 hours during business hours.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={btnContainer}>
            <a href={trackOrderUrl} style={button}>
              Track Your Order
            </a>
          </Section>

          <Text style={paragraph}>
            If you have any questions about your order, simply reply to this email
            and our support team will get back to you.
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            Wong Digital Shop Philippines — wongdigital.shop
          </Text>
          <Text style={footerSub}>
            You are receiving this email because you placed an order on Wong Digital Shop.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "580px",
}

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
}

const brandName = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#D97706",
  letterSpacing: "-0.02em",
  margin: "0",
}

const heading = {
  fontSize: "28px",
  lineHeight: "1.3",
  fontWeight: "700" as const,
  color: "#18181b",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3f3f46",
  margin: "0 0 16px 0",
}

const receiptSection = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
  border: "1px solid #e4e4e7",
}

const receiptHeading = {
  fontSize: "14px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#71717a",
  margin: "0 0 12px 0",
}

const divider = {
  borderColor: "#e4e4e7",
  margin: "16px 0",
}

const receiptRow = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  margin: "8px 0",
}

const itemName = {
  fontSize: "15px",
  color: "#3f3f46",
  margin: "0",
  flex: "1" as const,
}

const itemPrice = {
  fontSize: "15px",
  fontWeight: "600" as const,
  color: "#18181b",
  margin: "0",
  textAlign: "right" as const,
}

const totalLabel = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#18181b",
  margin: "0",
}

const totalValue = {
  fontSize: "18px",
  fontWeight: "700" as const,
  color: "#D97706",
  margin: "0",
  textAlign: "right" as const,
}

const metaLabel = {
  fontSize: "13px",
  color: "#71717a",
  margin: "0",
}

const metaValue = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#3f3f46",
  margin: "0",
  textAlign: "right" as const,
}

const nextStepsSection = {
  backgroundColor: "#FFFBEB",
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "24px",
  border: "1px solid #FDE68A",
}

const nextStepsHeading = {
  fontSize: "15px",
  fontWeight: "700" as const,
  color: "#92400E",
  margin: "0 0 8px 0",
}

const nextStepsBody = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#92400E",
  margin: "0",
}

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "32px",
}

const button = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
}

const footer = {
  color: "#a1a1aa",
  fontSize: "13px",
  textAlign: "center" as const,
  marginTop: "32px",
  margin: "0",
}

const footerSub = {
  color: "#d4d4d8",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "8px",
}
