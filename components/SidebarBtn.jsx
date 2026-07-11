import Link from 'next/link'
import React from 'react'

const SidebarBtn = ({label, Icon, isActive, href}) => {
  return (
    <div className='flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group'>
        <button className={'size-9 bg-transparent p-2 group-hover:bg-accent/20 '}>
            <Icon className='size-5 text-white group-hover:scale-110 cursor-pointer transition-all' />
        </button>
        <span className='text-[11px] text-white group-hover:text-accent'>
            {label}
        </span>
    </div>
  )
}

export default SidebarBtn