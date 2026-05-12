import Logo from '@/components/Logo'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

export default function AuthLayout() {
  return (
    <>
        <div className='min-h-screen bg-gray-900'>
            <div className='py-10 lg:py-20 mx-auto w-[450px]'>
                <div className='w-64 mx-auto mb-10 text-center'>
                    <Logo />
                </div>
                <div className='mt-10'>
                    <Outlet />
                </div>
            </div>
        </div>
        <ToastContainer
            pauseOnHover={false}
            pauseOnFocusLoss={false}
        />
    </>
  )
}
