import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addNoteApi, updateNoteApi } from "../redux/NotesApi";
const NoteModal = ({ isOpen, onClose, mode, noteData }) => {
  console.log("notedata", noteData);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    updatedAt: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    mode &&
      noteData &&
      setFormData({
        title: noteData.title,
        content: noteData.content,
        updatedAt: noteData.updatedAt,
      });
  }, [mode, noteData]);

  const handelSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill all the fields");
      return;
    }
    const payload = {
      title: formData.title,
      content: formData.content,
      updatedAt: new Date().toISOString(),
      id: noteData?.id,
    };

    try {
      const resp = mode ? await dispatch(updateNoteApi(payload)) : await dispatch(addNoteApi(payload));
      console.log("resp", resp);
      if (resp.payload.status === 201 || resp.payload.status === 200) {
        toast.success(mode ? "Note updated successfully" : "Note created successfully");
        setFormData({
          title: "",
          content: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Error creating note");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 className="text-lg font-bold mb-4">{mode ? "Update Note" : "Create Note"}</h2>

          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />

          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="5"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button onClick={handelSubmit} className="px-4 py-2 bg-orange-500 text-white rounded">
              {mode ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default NoteModal;
