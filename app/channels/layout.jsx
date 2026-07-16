import ChannelsSidebar from '@/components/ChannelsSidebar'
import React from 'react'

const Layout = ({children}) => {
  return (
    <div>
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden">
      {" "}
      <div className="flex-1 flex min-h-0">
        <ChannelsSidebar />
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