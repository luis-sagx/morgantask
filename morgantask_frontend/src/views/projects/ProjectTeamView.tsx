import { getProjectTeam, removeUserFromProject } from "@/api/TeamAPI"
import AddMemberModal from "@/components/team/AddMemberModal"
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment } from 'react'
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from 'react-toastify'


export default function ProjectTeamView() {

    const navigate = useNavigate()
    const params = useParams()
    const projectId = params.projectId!

    const { data, isLoading, isError} = useQuery({
        queryKey: ['projectTeam', projectId],
        queryFn: () => getProjectTeam(projectId),
        retry: false
    })

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: removeUserFromProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ['projectTeam', projectId]})
        }
    })

    if(isLoading) return 'Cargando...'
    if(isError) return <Navigate to={'/404'} />
    if(data) return (
        <>
            <h1 className="text-3xl font-bold">Administrar Equipo</h1>
            <p className="mt-2 text-base font-light text-gray-500">Administra el equipo de trabajo para este proyecto</p>

            <nav className="flex gap-3 my-5">
                <button
                    type="button"
                    className="px-4 py-2 font-medium text-white transition-colors rounded-md cursor-pointer bg-sky-400 hover:bg-sky-500"
                    onClick={() => navigate(location.pathname + '?addMember=true')}
                >Agregar Colaborador</button>

                <Link
                    to={`/projects/${projectId}`}
                    className="px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
                >Volver a Proyecto</Link>
                
            </nav>

            <h2 className="my-6 text-2xl font-bold">Miembros actuales</h2>
            {data.length ? (
                <ul role="list" className="mt-10 bg-white border border-gray-100 divide-y divide-gray-100 shadow-lg">
                    {data?.map((member) => (
                        <li key={member._id} className="flex justify-between px-5 py-10 gap-x-6">
                            <div className="flex min-w-0 gap-x-4">
                                <div className="flex-auto min-w-0 space-y-2">
                                    <p className="text-lg font-semibold text-gray-600">
                                        {member.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                       {member.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center shrink-0 gap-x-6">
                                <Menu as="div" className="relative flex-none">
                                    <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                                            <span className="sr-only">opciones</span>
                                            <EllipsisVerticalIcon className="h-9 w-9" aria-hidden="true" />
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 w-56 py-2 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                            <Menu.Item>
                                                <button
                                                    type='button'
                                                    className='block px-3 py-1 text-sm leading-6 text-red-500'
                                                    onClick={() => mutate({projectId, userId: member._id})}
                                                >
                                                    Eliminar del Proyecto
                                                </button>
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className='py-20 text-center'>No hay miembros en este equipo</p>
            )}

            <AddMemberModal />
        </>
    )
}
