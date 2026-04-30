import * as React from "react"
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "react-email"

interface OrderItem {
  name: string
  quantity: number
  price: string
}

interface OrderDeliveredEmailProps {
  orderCode: string
  customerName: string
  productName: string
  notes?: string
  items?: OrderItem[]
  totalPrice?: string
  paymentMethod?: string
}

export const OrderDeliveredEmail = ({
  orderCode,
  customerName,
  productName,
  notes,
  items,
  totalPrice,
  paymentMethod,
}: OrderDeliveredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order for {productName} has been delivered!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Order Delivered 🎉</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Great news! Your order <strong>{orderCode}</strong> for <strong>{productName}</strong> has been successfully fulfilled and delivered.
          </Text>

          {notes ? (
            <Section style={notesSection}>
              <Text style={notesHeading}>Delivery Details (Credentials/Instructions):</Text>
              <Text style={notesText}>{notes}</Text>
            </Section>
          ) : null}
          
          <Text style={paragraph}>
            Thank you for trusting Wong Digital Shop. If you experience any issues, just reply to this email or start a chat on our website.
          </Text>

          {items && items.length > 0 ? (
            <Section style={receiptSection}>
              <Text style={receiptHeading}>Order Summary</Text>
              <Hr style={dividerStyle} />
              {items.map((item, index) => (
                <Text key={index} style={itemLine}>
                  {item.name} × {item.quantity} — {item.price}
                </Text>
              ))}
              <Hr style={dividerStyle} />
              {totalPrice ? <Text style={totalLine}>Total: {totalPrice}</Text> : null}
              {paymentMethod ? <Text style={metaLine}>Payment: {paymentMethod}</Text> : null}
            </Section>
          ) : null}

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

const notesSection = {
  backgroundColor: "#f4f4f5",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "24px",
  marginBottom: "24px",
}

const notesHeading = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#18181b",
  margin: "0 0 8px 0",
}

const notesText = {
  fontSize: "15px",
  fontFamily: "monospace",
  color: "#18181b",
  margin: 0,
  whiteSpace: "pre-wrap" as const,
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

const dividerStyle = {
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
