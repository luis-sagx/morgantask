import { Popover, Transition } from '@headlessui/react'
import { ArrowRightOnRectangleIcon, Cog6ToothIcon, FolderIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import { useQueryClient } from '@tanstack/react-query'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { User } from '../types'

type NavMenuProps = {
  name: User['name']
}

export default function NavMenu({name} : NavMenuProps) {

  const queryClient = useQueryClient()
  const logout = () => {
    localStorage.removeItem('AUTH_TOKEN')
    queryClient.invalidateQueries({queryKey: ['user']})
  }

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center text-gray-300 transition-colors hover:text-white">
        <Cog6ToothIcon className='w-7 h-7' />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute z-10 flex w-screen mt-5 -translate-x-1/2 left-1/2 lg:max-w-min lg:-translate-x-48">
          <div className="w-full p-4 text-sm font-semibold leading-6 text-gray-900 bg-white shadow-lg lg:w-56 shrink rounded-xl ring-1 ring-gray-900/5">
            <p className='text-lg font-semibold'>Hola: {name}</p>
            <Link
              to='/profile'
              className='flex items-center gap-2 p-2 hover:text-sky-950'
            ><UserCircleIcon className='w-5 h-5' />Mi Perfil</Link>
            <Link
              to='/'
              className='flex items-center gap-2 p-2 hover:text-sky-950'
            ><FolderIcon className='w-5 h-5' />Mis Proyectos</Link>
            <button
              className='flex items-center w-full gap-2 p-2 hover:text-sky-950'
              type='button'
              onClick={logout}
            >
              <ArrowRightOnRectangleIcon className='w-5 h-5' />Cerrar Sesión
            </button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
