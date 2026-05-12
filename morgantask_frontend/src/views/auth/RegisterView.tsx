import { createAccount } from "@/api/AuthAPI";
import ErrorMessage from "@/components/ErrorMessage";
import { UserRegistrationForm } from "@/types/index";
import { useMutation } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterView() {
  
  const initialValues: UserRegistrationForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  }

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserRegistrationForm>({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: createAccount,
    onError: (error) => {
        toast.error(error.message)
    },
    onSuccess: (data) => {
        toast.success(data)
        reset()
    }
  })

  const password = watch('password');

  const handleRegister = (formData: UserRegistrationForm) => mutate(formData)

  return (
    <>
      <h1 className="text-5xl font-black text-white">Crear Cuenta</h1>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="p-10 mt-10 space-y-8 bg-white"
        noValidate
      >
        <div className="flex flex-col gap-5">
          <label
            className="text-2xl font-normal"
            htmlFor="email"
          >Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("email", {
              required: "El Email de registro es obligatorio",
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
            className="text-2xl font-normal"
          >Nombre</label>
          <input
            type="name"
            placeholder="Nombre de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("name", {
              required: "El Nombre de usuario es obligatorio",
            })}
          />
          {errors.name && (
            <ErrorMessage>{errors.name.message}</ErrorMessage>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <label
            className="text-2xl font-normal"
          >Contraseña</label>

          <input
            type="password"
            placeholder="Contraseña de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("password", {
              required: "La Contraseña es obligatoria",
              minLength: {
                value: 8,
                message: 'La Contraseña debe ser mínimo de 8 caracteres'
              }
            })}
          />
          {errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <label
            className="text-2xl font-normal"
          >Repetir Contraseña</label>

          <input
            id="password_confirmation"
            type="password"
            placeholder="Repite Contraseña de Registro"
            className="w-full p-3 border border-gray-300 rounded-md"
            {...register("password_confirmation", {
              required: "Repetir Contraseña es obligatorio",
              validate: value => value === password || 'Las Contraseñas no son iguales'
            })}
          />

          {errors.password_confirmation && (
            <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
          )}
        </div>

        <input
          type="submit"
          value='Registrarme'
          className="w-full p-3 text-xl font-black text-white transition-colors duration-200 bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
        />
      </form>

      <nav className="flex flex-col mt-10 space-y-4">
            <Link
                to={'/auth/login'}
                className="font-normal text-center text-sky-500"
            >¿Ya tienes cuenta? Iniciar Sesión</Link>
      </nav>
    </>
  )
}