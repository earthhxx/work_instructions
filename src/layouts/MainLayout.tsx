import React from 'react'
// import Navbar from '../components/Navbar'
import MenuToggle from '../components/MenuToggle'



type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className={`flex flex-col font-kanit font-normal`}>
      <MenuToggle />
      <main className="flex-1">{children}</main>
    </div>
  )
}
