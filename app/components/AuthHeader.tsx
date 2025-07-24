import { FC } from 'react'

interface AuthHeaderProps {
  title: string
  subtitle: string
}

const AuthHeader: FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h1 className="text-25 mb-10 font-bold">{title}</h1>
      <p className="mb-40 text-center text-16 font-normal">{subtitle}</p>
    </>
  )
}

export default AuthHeader
