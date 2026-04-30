import * as React from "react"
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "react-email"

interface OrderCompletedEmailProps {
  orderCode: string
  customerName: string
  reviewUrl: string
}

export const OrderCompletedEmail = ({
  orderCode,
  customerName,
  reviewUrl,
}: OrderCompletedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your order {orderCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Order Completed ✅</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            This is a quick note to let you know that your order <strong>{orderCode}</strong> has been marked as complete. We hope you're enjoying your purchase!
          </Text>

          <Section style={btnContainer}>
            <Link href={reviewUrl} style={button}>
              Leave a Review
            </Link>
          </Section>
          
          <Text style={paragraph}>
            Your feedback means the world to us. Take a moment to share your experience to help us improve and guide future customers!
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
  display: "inline-block",
  padding: "14px 28px",
}

const footer = {
  color: "#a1a1aa",
  fontSize: "14px",
  marginTop: "48px",
}
