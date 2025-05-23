import React, { useEffect, useState } from "react";
import { Trash2, SquarePen, PlusCircle } from "lucide-react";
import { deleteNoteApi, getAllNotesApi } from "../redux/NotesApi";
import { useDispatch, useSelector } from "react-redux";
import NoteModal from "./NoteModel";
import { toast } from "react-toastify";

const Home = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const getNotes = useSelector((state) => state.getAllNotes.getAllNotes);
  console.log("getNotes", getNotes);
  useEffect(() => {
    const notesData = async () => {
      try {
        const resp = await dispatch(getAllNotesApi());
        console.log("resp", resp);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    notesData();
  }, [dispatch]);
  // this is for the  edit
  const handleEditClick = (note) => {
    setSelectedNote(note);
    setModalMode(true);
    setIsModalOpen(true);
  };

  // this is for the add
  const handleAddClick = () => {
    setSelectedNote(null);
    setModalMode(false);
    setIsModalOpen(true);
  };

  // this is for the delete
  const handleDeleteClick = async (note) => {
    try {
      const resp = await dispatch(deleteNoteApi(note.id));
      console.log("resp", resp);
      if (resp.payload.status === 200) {
        toast.success("Note deleted successfully");
        const resp = await dispatch(getAllNotesApi());
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <>
      <div className="p-4 bg-orange-50 min-h-screen">
        {/* Add Note Button */}
        <div className="mb-4 flex justify-end">
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded shadow transition" onClick={handleAddClick}>
            <PlusCircle size={18} />
            Add Note
          </button>
        </div>

        {/* Notes Table */}
        <div className="overflow-x-auto border rounded-md bg-white shadow-md">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-orange-100 text-gray-800 uppercase">
              <tr>
                <th className="px-4 py-3 border">Actions</th>
                <th className="px-4 py-3 border">Title</th>
                <th className="px-4 py-3 border">Content</th>
                <th className="px-4 py-3 border">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {getNotes && getNotes.length > 0 ? (
                getNotes.map((note, idx) => (
                  <tr key={idx} className="hover:bg-orange-50 border-t">
                    <td className="px-4 py-2 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <SquarePen size="16" strokeWidth="1" color="#F97316" className="cursor-pointer" onClick={() => handleEditClick(note)} />
                        <Trash2 size="16" strokeWidth="1" color="#F97316" className="cursor-pointer" onClick={() => handleDeleteClick(note)} />
                      </div>
                    </td>
                    <td className="px-4 py-2 border">{note.title}</td>
                    <td className="px-4 py-2 border">{note.content}</td>
                    <td className="px-4 py-2 border">{new Date(note.updatedAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 border text-center text-gray-500" colSpan="4">
                    No notes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Below */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(updatedNote) => {
          console.log("Updated Note:", updatedNote);
          setIsModalOpen(false);
        }}
        mode={modalMode}
        noteData={selectedNote}
      />
    </>
  );
};

export default Home;
