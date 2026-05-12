import { getFullProject } from "@/api/ProjectAPI"
import AddTaskModal from "@/components/tasks/AddTaskModal"
import EditTaskData from "@/components/tasks/EditTaskData"
import TaskList from "@/components/tasks/TaskList"
import TaskModalDetails from "@/components/tasks/TaskModalDetails"
import { useAuth } from "@/hooks/useAuth"
import { isManager } from "@/utils/policies"
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
            <h1 className="text-3xl font-bold">{data.projectName}</h1>
            <p className="mt-2 text-base font-light text-gray-500">{data.description}</p>

            {isManager(data.manager, user._id) && (
                <nav className="flex gap-3 my-5">
                    <button
                        type="button"
                        className="px-4 py-2 font-medium text-white transition-colors rounded-md cursor-pointer bg-sky-400 hover:bg-sky-500"
                        onClick={() => navigate(location.pathname + '?newTask=true')}
                    >Agregar Tarea</button>

                    <Link
                        to={'team'}
                        className="px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
                    >Colaboradores</Link>
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
