import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import DropTask from './DropTask'

// Mock de useDroppable
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core')
  return {
    ...actual,
    useDroppable: vi.fn(() => ({
      isOver: false,
      setNodeRef: vi.fn()
    }))
  }
})

describe('DropTask', () => {
  it('debe renderizar el mensaje de soltar tarea', () => {
    render(
      <DndContext>
        <DropTask status="pending" />
      </DndContext>
    )
    expect(screen.getByText('Soltar tarea aquí')).toBeInTheDocument()
  })

  it('debe renderizar con las clases de estilo correctas', () => {
    render(
      <DndContext>
        <DropTask status="pending" />
      </DndContext>
    )
    const div = screen.getByText('Soltar tarea aquí')
    expect(div).toHaveClass('text-xs', 'font-semibold', 'uppercase', 'p-2', 'border', 'border-dashed', 'border-slate-500', 'mt-5', 'grid', 'place-content-center', 'text-slate-500')
  })
})