import { deleteNote } from "@/api/NoteAPI"
import { useAuth } from "@/hooks/useAuth"
import { Note } from "@/types/index"
import { formatDate } from "@/utils/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"
import { toast } from "react-toastify"


type NoteDetailProps = {
    note: Note
}

export default function NoteDetail({ note }: NoteDetailProps) {

    const { data, isLoading } = useAuth()
    const canDelete = useMemo(() => data?._id === note.createdBy._id, [data, note.createdBy._id])
    const params = useParams()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    
    const projectId = params.projectId!
    const taskId = queryParams.get('viewTask')!

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: deleteNote,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data)
            queryClient.invalidateQueries({queryKey: ['task', taskId]})
        }
    })

    if (isLoading) return 'Cargando...'

    return (
        <div className="flex items-center justify-between p-3">
            <div>
                <p>
                    {note.content} 
                    <br />
                    <span className="text-sm font-bold">por: {note.createdBy.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                    {formatDate(note.createdAt)}
                </p>
            </div>

            {canDelete && (
                <button
                    type="button"
                    className="p-2 text-sm font-bold text-white transition-colors bg-red-400 rounded-md cursor-pointer hover:bg-red-500"
                    onClick={() => mutate({projectId, taskId, noteId: note._id})}
                >Eliminar</button>
            )}
        </div>
    )
}
