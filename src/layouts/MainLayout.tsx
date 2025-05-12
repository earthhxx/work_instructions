import React from 'react'
// import Navbar from '../components/Navbar'
import MenuToggle from '../components/MenuToggle'

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex flex-col">
      <MenuToggle />
      <main className="flex-1 p-4 bg-white-50">{children}</main>
    </div>
  )
}
