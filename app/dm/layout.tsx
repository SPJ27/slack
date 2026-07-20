import React from 'react'
import DMSidebar from '@/components/DMSiderbar'

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex min-h-0">
        <DMSidebar />
        {children}
      </div>
    </div>
  
    </div>
  )
}

export const metadata = {
    title: 'View Channel'
}

export default Layout