import { changePassword } from "@/api/ProfileAPI";
import ErrorMessage from "@/components/ErrorMessage";
import { UpdateCurrentUserPasswordForm } from "@/types/index";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function ChangePasswordView() {
  const initialValues : UpdateCurrentUserPasswordForm = {
    current_password: '',
    password: '',
    password_confirmation: ''
  }

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: initialValues })

  const { mutate } = useMutation({
      mutationFn: changePassword,
      onError: (error) => toast.error(error.message),
      onSuccess: (data)  => toast.success(data)
  })

  const password = watch('password');
  const handleChangePassword = (formData : UpdateCurrentUserPasswordForm) => mutate(formData)

  return (
    <div className="max-w-3xl mx-auto">
      
      <h1 className="text-3xl font-bold">Cambiar Contraseña</h1>

      <form
        onSubmit={handleSubmit(handleChangePassword)}
        className="p-10 space-y-5 bg-white rounded-lg shadow-lg mt-14"
        noValidate
      >
        <div className="mb-5 space-y-3">
          <label
            className="text-sm font-bold uppercase"
            htmlFor="current_password"
          >Contraseña Actual</label>
          <input
            id="current_password"
            type="password"
            placeholder="Contraseña Actual"
            className="w-full p-3 border border-gray-200"
            {...register("current_password", {
              required: "La contraseña actual es obligatoria",
            })}
          />
          {errors.current_password && (
            <ErrorMessage>{errors.current_password.message}</ErrorMessage>
          )}
        </div>

        <div className="mb-5 space-y-3">
          <label
            className="text-sm font-bold uppercase"
            htmlFor="password"
          >Nueva Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Nueva Contraseña"
            className="w-full p-3 border border-gray-200"
            {...register("password", {
              required: "La nueva contraseña es obligatoria",
              minLength: {
                value: 8,
                message: 'La contraseña debe ser mínima de 8 caracteres'
              }
            })}
          />
          {errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </div>
        <div className="mb-5 space-y-3">
          <label
            htmlFor="password_confirmation"
            className="text-sm font-bold uppercase"
          >Repetir Contraseña</label>

          <input
            id="password_confirmation"
            type="password"
            placeholder="Repetir Contraseña"
            className="w-full p-3 border border-gray-200"
            {...register("password_confirmation", {
              required: "Este campo es obligatorio",
              validate: value => value === password || 'Las contraseñas no son iguales'
            })}
          />
          {errors.password_confirmation && (
            <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
          )}
        </div>

        <input
          type="submit"
          value='Cambiar Contraseña'
          className="w-full p-3 text-sm font-medium text-white uppercase transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-cyan-500"
        />
      </form>
    </div>
  )
}
