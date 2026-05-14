import { authenticateUser } from "@/api/AuthAPI";
import ErrorMessage from "@/components/ErrorMessage";
import { UserLoginForm } from "@/types/index";
import { useMutation } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LoginView() {

  const initialValues: UserLoginForm = {
    email: '',
    password: '',
  }
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues })
  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: authenticateUser,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      navigate('/')
    }
  })

  const handleLogin = (formData: UserLoginForm) => mutate(formData)

  return (
    <>
        <h1 className="text-3xl font-bold text-white">Iniciar Sesión</h1>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="p-10 mt-10 space-y-8 bg-white"
        noValidate
      >
        <div className="flex flex-col gap-5">
          <label
            className="text-base font-normal"
            htmlFor="email"
          >Email</label>

          <input
            id="email"
            type="email"
            placeholder="Email de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("email", {
              required: "El Email es obligatorio",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "E-mail no válido",
              },
            })}
          />
          {errors.email && (
            <ErrorMessage>{errors.email.message}</ErrorMessage>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <label
            className="text-base font-normal"
            htmlFor="password"
          >Contraseña</label>

          <input
            id="password"
            type="password"
            placeholder="Contraseña de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("password", {
              required: "La Contraseña es obligatoria",
            })}
          />
          {errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </div>

        <input
          type="submit"
          value='Iniciar Sesión'
          className="w-full p-3 text-base font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
        />
      </form>

      <nav className="flex flex-col mt-10 space-y-4">
            <Link
                to={'/auth/register'}
                className="font-normal text-center text-sky-500"
            >¿No tienes cuenta? Crear Una</Link>
      </nav>
    </>
  )
}
