import { ReactNode } from 'react'
import Sidebar from 'src/components/Sidebar'
import UpdateBanner from 'src/components/UpdateBanner'
import WalletWidget from 'src/components/WalletWidget'
import DraggableArea from 'src/components/DraggableArea'

const Layout = ({ children }: {children: ReactNode}) => {
  return (
    <div className='h-screen w-screen overflow-x-hidden flex relative app-bg'>
      <DraggableArea />
      <Sidebar />
      <main className='flex-1 px-20'>
        <div className='w-full flex flex-wrap justify-end'>
          <UpdateBanner />
          <WalletWidget />
        </div>
        {children}
      </main>
    </div>
  )
}

export default Layout