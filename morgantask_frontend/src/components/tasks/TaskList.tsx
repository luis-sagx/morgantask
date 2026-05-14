import { updateStatus } from '@/api/TaskAPI'
import { statusTranslations } from "@/locales/es"
import { Project, TaskProject, TaskStatus } from "@/types/index"
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DropTask from "./DropTask"
import TaskCard from "./TaskCard"

type TaskListProps = {
    tasks: TaskProject[]
    canEdit: boolean
}

type GroupedTasks = {
    [key: string]: TaskProject[]
}

const initialStatusGroups: GroupedTasks = {
    pending: [],
    onHold: [],
    inProgress: [],
    underReview: [],
    completed: [],
}

const statusStyles: { [key: string]: string } = {
    pending: 'bg-slate-300 text-gray-700',
    onHold: 'bg-red-300 text-red-700',
    inProgress: 'bg-blue-300 text-blue-700',
    underReview: 'bg-amber-300 text-amber-700',
    completed: 'bg-emerald-300 text-emerald-700',
}

export default function TaskList({ tasks, canEdit }: Readonly<TaskListProps>) {

    const params = useParams()
    const projectId = params.projectId!
    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateStatus,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        }
    })

    const groupedTasks = tasks.reduce((acc, task) => {
        const currentGroup = acc[task.status] ?? []
        return { ...acc, [task.status]: [...currentGroup, task] };
    }, initialStatusGroups);

    const handleDragEnd = (e: DragEndEvent) => {
        const { over, active } = e

        if (over?.id) {
            const taskId = active.id.toString()
            const status = over.id as TaskStatus
            mutate({ projectId, taskId, status })

            queryClient.setQueryData(['project', projectId], (prevData: Project) => {
                const updatedTasks = prevData.tasks.map((task) => {
                    if(task._id === taskId) {
                        return {
                            ...task,
                            status
                        }
                    }
                    return task
                })

                return {
                    ...prevData,
                    tasks: updatedTasks
                }
            })
        }
    }

    return (
        <>
            <h2 className="my-8 text-2xl font-bold">Tareas</h2>

            <div className='flex gap-5 pb-32 overflow-x-scroll 2xl:overflow-auto'>
                <DndContext onDragEnd={handleDragEnd} >
                    {Object.entries(groupedTasks).map(([status, tasks]) => (
                        <div key={status} className='min-w-[300px] 2xl:min-w-0 2xl:w-1/5'>
                            <h3
                                className={`p-3 ${statusStyles[status]}`}
                            >
                                    {statusTranslations[status]}
                            </h3>

                            <DropTask status={status} />

                            <ul className='mt-5 space-y-5'>
                                {tasks.length === 0 ? (
                                    <li className="pt-3 text-center text-gray-500">No Hay tareas</li>
                                ) : (
                                    tasks.map(task => <TaskCard key={task._id} task={task} canEdit={canEdit} />)
                                )}
                            </ul>
                        </div>
                    ))}
                </DndContext>
            </div>
        </>
    )
}
