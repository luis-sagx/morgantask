import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'
import NotesPanel from './NotesPanel'

vi.mock('./AddNoteForm', () => ({
  default: () => <div>AddNoteForm</div>
}))
vi.mock('./NoteDetail', () => ({
  default: ({ note }: any) => <div>Note: {note._id}</div>
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('NotesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el formulario de agregar nota', () => {
    render(<NotesPanel notes={[]} />, { wrapper: createWrapper() })
    expect(screen.getByText('AddNoteForm')).toBeInTheDocument()
  })

  it('debe mostrar mensaje cuando no hay notas', () => {
    render(<NotesPanel notes={[]} />, { wrapper: createWrapper() })
    expect(screen.getByText('No hay notas')).toBeInTheDocument()
  })

  it('debe renderizar las notas existentes', () => {
    const mockNotes = [
      {
        _id: 'note1',
        content: 'Note 1',
        createdBy: { _id: 'user1', name: 'User 1', email: 'user1@test.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
        task: 'task1'
      },
      {
        _id: 'note2',
        content: 'Note 2',
        createdBy: { _id: 'user2', name: 'User 2', email: 'user2@test.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
        task: 'task1'
      }
    ]

    render(<NotesPanel notes={mockNotes} />, { wrapper: createWrapper() })
    expect(screen.getByText('Notas:')).toBeInTheDocument()
    expect(screen.getByText('Note: note1')).toBeInTheDocument()
    expect(screen.getByText('Note: note2')).toBeInTheDocument()
  })

  it('debe renderizar una nota individual', () => {
    const mockNotes = [
      {
        _id: 'note1',
        content: 'Single Note',
        createdBy: { _id: 'user1', name: 'User 1', email: 'user1@test.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
        task: 'task1'
      }
    ]

    render(<NotesPanel notes={mockNotes} />, { wrapper: createWrapper() })
    expect(screen.getByText('Notas:')).toBeInTheDocument()
    expect(screen.getByText('Note: note1')).toBeInTheDocument()
  })
})
