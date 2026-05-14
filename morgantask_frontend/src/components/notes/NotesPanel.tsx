import { Task } from "@/types/index";
import AddNoteForm from "./AddNoteForm";
import NoteDetail from "./NoteDetail";

type NotesPanelProps = {
    notes: Task['notes']
}

export default function NotesPanel({notes} : Readonly<NotesPanelProps>) {
  return (
    <div>
        <AddNoteForm />

        <div className="mt-8 divide-y divide-gray-100">
            {notes.length ? (
                <>
                    <p className="my-2 text-lg font-bold text-indigo-600">Notas:</p>
                    {notes.map(note => <NoteDetail key={note._id} note={note} />)}
                </>
            ) : <p className="pt-3 text-center text-gray-500">No hay notas</p>}
        </div>
    </div>
  )
}
