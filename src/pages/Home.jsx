import React, { useEffect, useState } from "react";
import { Trash2, SquarePen, PlusCircle } from "lucide-react";
import { deleteNoteApi, getAllNotesApi } from "../redux/NotesApi";
import { useDispatch, useSelector } from "react-redux";
import NoteModal from "./NoteModel";
import { toast } from "react-toastify";
import { addNoteToDb, addToDeletedQueue, deleteNoteFromDb, getAllNotesFromDb } from "../db/db";

const Home = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteData, setNoteData] = useState(null);

  const getNotes = useSelector((state) => state.getAllNotes.getAllNotes);
  console.log("getNotes", getNotes);
  useEffect(() => {
    const notesData = async () => {
      try {
        if (navigator.onLine) {
          const resp = await dispatch(getAllNotesApi());
          console.log("resp", resp);
          if (resp.payload.data) {
            setNoteData(resp.payload.data);
            const dbData = await getAllNotesFromDb();
            console.log("dbData", dbData);
            // first check is data in db or not
            const dbIds = new Set(dbData.map((note) => String(note.id)));
            const filterData = resp.payload.data.filter((note) => !dbIds.has(String(note.id)));
            console.log("filterData", filterData);

            for (const note of filterData) {
              const data = resp.payload.data.filter((item) => item.id === note.id);
              console.log("data", data);
              const response = await addNoteToDb(note);
              console.log("loacal save response", response);
            }
          }
        } else {
          console.log("offline");
          const offlineData = await getAllNotesFromDb();
          console.log("offlineData", offlineData);
          setNoteData(offlineData);
        }
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
      if (navigator.onLine) {
        const resp = await dispatch(deleteNoteApi(note.id));
        console.log("resp", resp);
        if (resp.payload.status === 200) {
          toast.success("Note deleted successfully");
          const resp = await dispatch(getAllNotesApi());
          setNoteData(resp.payload.data);
        }
      } else {
        const resp = await deleteNoteFromDb(note.id);
        const resp1 = await addToDeletedQueue(note);
        console.log(" offline delt resp and qu", resp, resp1);
        toast.success("Note deleted successfully");
        const dbData = await getAllNotesFromDb();
        setNoteData(dbData);
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
              {noteData && noteData.length > 0 ? (
                noteData.map((note, idx) => (
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
        setNoteData={setNoteData}
      />
    </>
  );
};

export default Home;
