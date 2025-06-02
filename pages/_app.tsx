import { Fragment } from 'react'


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Fragment>
      <main className="min-h-screen">{children}</main>
    </Fragment>
  )
}
