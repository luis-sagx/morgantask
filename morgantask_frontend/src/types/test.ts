import type { UseQueryResult } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import type { User } from './index'
import type { Task, TaskStatus } from './index'

// Tipos para mocks de useAuth
export type UseAuthMock = Pick<UseQueryResult<User>, 'data' | 'isError' | 'isLoading'>

// Tipos para mocks de useQuery
export type UseQueryMock<T> = Pick<UseQueryResult<T>, 'data' | 'isError' | 'isLoading' | 'error'>

// Tipos para mocks de useMutation
export type UseMutationMock<TData = unknown, TError = unknown, TVariables = void> =
  Pick<UseMutationResult<TData, TError, TVariables>, 'mutate' | 'isLoading'>

// Tipos para mock de useQueryClient
export type UseQueryClientMock = {
  invalidateQueries: ReturnType<typeof vi.fn>
  setQueryData?: ReturnType<typeof vi.fn>
}

// Tipos para mock de axios
export type AxiosMockData<T> = {
  data: T
  isAxiosError?: boolean
  response?: {
    data: {
      error: string
    }
  }
}

// Tipos para formData de tasks
export type TaskFormDataMock = Pick<Task, 'name' | 'description'>

// Tipos para status de tasks
export type TaskStatusMock = TaskStatus

// Tipos para mock de queryClient en tests
export type QueryClientMockOptions = {
  queries?: { retry: boolean }
  mutations?: { retry: boolean }
}