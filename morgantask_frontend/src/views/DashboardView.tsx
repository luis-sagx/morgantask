import { getProjects } from "@/api/ProjectAPI"
import DeleteProjectModal from '@/components/projects/DeleteProjectModal'
import { useAuth } from '@/hooks/useAuth'
import { isManager } from '@/utils/policies'
import { EyeIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from "react-router-dom"

export default function DashboardView() {

  const location = useLocation()
  const navigate = useNavigate()
  const { data: user, isLoading: authLoading } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  })
  if (isLoading && authLoading) return 'Cargando...'
  if (data && user) return (
    <>
      <h1 className="text-3xl font-bold">Mis Proyectos</h1>
      <p className="mt-2 text-base font-light text-gray-500">Maneja y administra tus proyectos</p>

      <nav className="my-5 ">
        <Link
          className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white transition-colors rounded-md cursor-pointer bg-sky-500 hover:bg-sky-600"
          to='/projects/create'
        ><PlusIcon className="w-5 h-5" />Nuevo Proyecto</Link>
      </nav>

      {data.length ? (
        <ul role="list" className="mt-10 bg-white border border-gray-100 divide-y divide-gray-100 shadow-lg">
          {data.map((project) => (
            <li key={project._id} className="flex justify-between px-5 py-10 gap-x-6">
              <div className="flex min-w-0 gap-x-4">
                <div className="flex-auto min-w-0 space-y-2">
                  <div className='mb-2'>
                    { isManager(project.manager, user._id) ?
                      <p className='inline-block px-5 py-1 text-xs font-bold text-indigo-500 uppercase border-2 border-indigo-500 rounded-lg bg-indigo-50'>Manager</p> :
                      <p className='inline-block px-5 py-1 text-xs font-bold text-green-500 uppercase border-2 border-green-500 rounded-lg bg-green-50'>Colaborador</p>
                    }
                  </div>
                  <Link to={`/projects/${project._id}`}
                    className="text-xl font-semibold text-gray-600 cursor-pointer hover:underline"
                  >{project.projectName}</Link>
                  <p className="text-sm text-gray-600">
                    Cliente: {project.clientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center shrink-0 gap-x-4">
                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-400 rounded-lg hover:bg-indigo-500 transition-colors"
                  title="Ver Proyecto"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver
                </Link>

                { isManager(project.manager, user._id) && (
                  <>
                    <Link
                      to={`/projects/${project._id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                      title="Editar Proyecto"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      type='button'
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      title="Eliminar Proyecto"
                      onClick={() => navigate(location.pathname + `?deleteProject=${project._id}`)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-20 text-center">No hay proyectos aún {''}
          <Link
            to='/projects/create'
            className="font-bold text-cyan-400"
          >Crear Proyecto</Link>
        </p>
      )}


      <DeleteProjectModal />
    </>
  )
}
