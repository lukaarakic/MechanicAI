import { redirect } from '@remix-run/node'

export async function loader() {
  return redirect('/settings/account')
}

const Index = () => {
  return <div></div>
}

export default Index
