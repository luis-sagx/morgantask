import { createProject } from "@/api/ProjectAPI"
import ProjectForm from "@/components/projects/ProjectForm"
import { ProjectFormData } from "@/types/index"
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'

export default function CreateProjectView() {

    const navigate = useNavigate()
    const initialValues : ProjectFormData = {
        projectName: "",
        clientName: "",
        description: ""
    }

    const {register, handleSubmit, formState: {errors}} = useForm({defaultValues: initialValues})

    const {mutate} = useMutation({
        mutationFn: createProject,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            navigate('/')
        }
    })

    const handleForm = (formData : ProjectFormData) => mutate(formData)

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Crear Proyecto</h1>
            <p className="mt-2 text-base font-light text-gray-500">Llena el siguiente formulario para crear un proyecto</p>

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
                    value='Crear Proyecto'
                    className="w-full p-3 text-sm font-medium text-white uppercase transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
                />  
            </form>
        </div>
    )
}
