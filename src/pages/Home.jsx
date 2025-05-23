import React, { useEffect, useState } from "react";
import { Trash2, SquarePen, PlusCircle } from "lucide-react";
import { addNoteApi, deleteNoteApi, getAllNotesApi, updateNoteApi } from "../redux/NotesApi";
import { useDispatch, useSelector } from "react-redux";
import NoteModal from "./NoteModel";
import { toast } from "react-toastify";
import { addNoteToDb, addToDeletedQueue, deleteNoteFromDb, getAllNotesFromDb, getDeletedNotesFromDb, removeFromDeletedQueue, updateNoteInDb } from "../db/db";

const Home = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [search, setSearch] = useState("");

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

            for (const note of resp.payload.data) {
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
          const resp1 = await deleteNoteFromDb(note.id);
        }
      } else {
        const resp = await deleteNoteFromDb(note.id);
        const resp1 = await addToDeletedQueue({ ...note, operation: "delete", syncStatus: "unsynced" });
        console.log(" offline delt resp and qu", resp, resp1);
        toast.success("Note deleted successfully");
        const dbData = await getAllNotesFromDb();
        setNoteData(dbData);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // useEffect(() => {
  //   const handleDataSycan = async () => {
  //     const getAllData = await getAllNotesFromDb();
  //     console.log("getAllData", getAllData);
  //     getAllData.forEach((item) => {
  //       if (item.operation === "update" && item.syncStatus === "unsynced") {
  //         const res = dispatch(updateNoteApi({ ...item, operation: "", syncStatus: " " }));
  //         const res1 = updateNoteInDb({ ...item, operation: "", syncStatus: " " });
  //       } else if (item.operation === "create" && item.syncStatus === "unsynced") {
  //         const res = dispatch(addNoteApi({ ...item, operation: "", syncStatus: " " }));
  //         console.log("this is res of the crate the  auto sync ", res);
  //         const res1 = addNoteToDb({ ...item, operation: "", syncStatus: " " });
  //       } else if (item.operation === "delete" && item.syncStatus === "unsynced") {
  //         const res = dispatch(deleteNoteApi(item.id));
  //         const res1 = removeFromDeletedQueue(item.id);
  //       }
  //     });
  //   };
  //   handleDataSycan();
  // }, [dispatch, navigator.onLine]);

  useEffect(() => {
    console.log("heloo");
    const handleDataSync = async () => {
      console.log("offline");
      const Data = await getAllNotesFromDb();
      const deltData = await getDeletedNotesFromDb();
      console.log("deltData", deltData);

      for (const item of Data) {
        if (item.syncStatus === "unsynced") {
          console.log("log");
          try {
            if (item.operation === "update") {
              const res = await dispatch(updateNoteApi({ ...item, syncStatus: "synced", operation: "" }));
            } else if (item.operation === "create") {
              const res = await dispatch(addNoteApi({ ...item, syncStatus: "synced", operation: "" }));
            } else if (item.operation === "delete") {
              console.log("delt");
              const res = await dispatch(deleteNoteApi(item.id));
              const res1 = removeFromDeletedQueue(item.id);
            }

            // ✅ Update sync status in IndexedDB
            await updateNoteInDb({ ...item, syncStatus: "synced", operation: "" });
          } catch (err) {
            console.error("Sync error:", err);
            await updateNoteInDb({ ...item, syncStatus: "error" });
          }
        }
      }
      for (const item of deltData) {
        if (item.syncStatus === "unsynced") {
          if (item.operation === "delete") {
            console.log("delt");
            const res = await dispatch(deleteNoteApi(item.id));
            const res1 = removeFromDeletedQueue(item.id);
          }
        }
      }
    };

    if (navigator.onLine) {
      handleDataSync();
    }

    window.addEventListener("online", handleDataSync);
    return () => window.removeEventListener("online", handleDataSync);
  }, [dispatch]);

  const handelfilter = (e) => {
    const data = e.target.value;
    setSearch(e.target.value);

    const newData = noteData.filter((note) => note.title.toLowerCase().includes(data.toLowerCase()) || note.content.toLowerCase().includes(data.toLowerCase()));
    console.log("newData", newData);
    setNoteData(newData);
  };

  return (
    <>
      <div className="p-4 bg-orange-50 min-h-screen">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={handelfilter}
            className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
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
                <th className="px-4 py-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {noteData && noteData.length > 0 ? (
                noteData.map((note, idx) => (
                  <tr key={note.id} className="hover:bg-orange-50 border-t">
                    <td className="px-4 py-2 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <SquarePen size="16" strokeWidth="1" color="#F97316" className="cursor-pointer" onClick={() => handleEditClick(note)} />
                        <Trash2 size="16" strokeWidth="1" color="#F97316" className="cursor-pointer" onClick={() => handleDeleteClick(note)} />
                      </div>
                    </td>
                    <td className="px-4 py-2 border">{note.title}</td>
                    <td className="px-4 py-2 border">{note.content}</td>
                    <td className="px-4 py-2 border">{new Date(note.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{note?.syncStatus ?? "synced"}</td>
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
