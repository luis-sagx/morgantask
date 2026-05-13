import { getFullProject } from "@/api/ProjectAPI"
import AddTaskModal from "@/components/tasks/AddTaskModal"
import EditTaskData from "@/components/tasks/EditTaskData"
import TaskList from "@/components/tasks/TaskList"
import TaskModalDetails from "@/components/tasks/TaskModalDetails"
import { useAuth } from "@/hooks/useAuth"
import { isManager } from "@/utils/policies"
import { ArrowLeftIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

export default function ProjectDetailsView() {

    const { data: user, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()

    const params = useParams()
    const projectId = params.projectId!
    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getFullProject(projectId),
        retry: false
    })
    const canEdit = useMemo(() => data?.manager === user?._id , [data, user])
    if (isLoading && authLoading) return 'Cargando...'
    if (isError) return <Navigate to='/404' />
    if (data && user) return (
        <>
            <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 transition-colors mb-4"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Regresar
            </button>

            <h1 className="text-3xl font-bold">{data.projectName}</h1>
            <p className="mt-2 text-base font-light text-gray-500">{data.description}</p>

            {isManager(data.manager, user._id) && (
                <nav className="flex gap-3 my-5">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white transition-colors rounded-md cursor-pointer bg-sky-400 hover:bg-sky-500"
                        onClick={() => navigate(location.pathname + '?newTask=true')}
                    >
                        <PlusIcon className="w-5 h-5" />
                        Agregar Tarea
                    </button>

                    <Link
                        to={'team'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700"
                    >
                        <UsersIcon className="w-5 h-5" />
                        Colaboradores
                    </Link>
                </nav>
            )}

            <TaskList
                tasks={data.tasks}
                canEdit={canEdit}
            />
            <AddTaskModal />
            <EditTaskData />
            <TaskModalDetails />
        </>
    )
}
