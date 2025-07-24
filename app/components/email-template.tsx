import { Container, Html, Text, Link } from '@react-email/components'

export default function EmailTemplate({
  redirectTo,
  otp,
  title,
}: {
  redirectTo: string
  otp: string
  title: string
}) {
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h1>
          <Text>{title}</Text>
        </h1>
        <p>
          <Text>
            Here's your verification code: <strong>{otp}</strong>
          </Text>
        </p>
        <p>
          <Text>Or click the link:</Text>
        </p>
        <Link href={redirectTo}>{redirectTo}</Link>
      </Container>
    </Html>
  )
}
