import { updateProject } from '@/api/ProjectAPI'
import { Project, ProjectFormData } from '@/types/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ProjectForm from './ProjectForm'

type EditProjectFormProps = {
    data: ProjectFormData
    projectId: Project['_id']
}

export default function EditProjectForm({data, projectId} : Readonly<EditProjectFormProps>) {

    const navigate = useNavigate()
    const {register, handleSubmit, formState: {errors}} = useForm({defaultValues: {
        projectName: data.projectName,
        clientName: data.clientName,
        description: data.description
    }})
    
    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: updateProject,
        onError: (error) => {
           toast.error(error.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['projects']})
            queryClient.invalidateQueries({queryKey: ['editProject', projectId]})
            toast.success(data)
            navigate('/')
        }
    })

    const handleForm = (formData: ProjectFormData) => {
        const data = {
            formData,
            projectId
        }
        mutate(data)
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Editar Proyecto</h1>
            <p className="mt-2 text-base font-light text-gray-500">Llena el siguiente formulario para editar el proyecto</p>

            <nav className="my-5 ">
                <Link
                    className="px-4 py-2 font-medium text-white transition-colors rounded-md cursor-pointer bg-sky-400 hover:bg-sky-500"
                    to='/'
                >Volver a Proyectos</Link>
            </nav>

            <form
                className="p-10 mt-10 bg-white rounded-lg shadow-lg"
                onSubmit={handleSubmit(handleForm)}
                noValidate
            >

                <ProjectForm 
                    register={register}
                    errors={errors}
                />
                
                <input
                    type="submit"
                    value='Guardar Cambios'
                    className="w-full p-3 text-sm font-medium text-white uppercase transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
                />  
            </form>
        </div>
    )
}
