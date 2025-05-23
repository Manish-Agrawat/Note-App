import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getAllNotesApi = createAsyncThunk("/get", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`https://682fe255f504aa3c70f587cc.mockapi.io/notes/get-notes-list`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response", response.data);

    return response;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return rejectWithValue(error);
  }
});

// add note
export const addNoteApi = createAsyncThunk("/get-list", async (noteData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`https://682fe255f504aa3c70f587cc.mockapi.io/notes/get-notes-list`, noteData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response response onl add", response);

    return response;
  } catch (error) {
    console.error("Error adding note:", error);
    return rejectWithValue(error);
  }
});

//  update note
export const updateNoteApi = createAsyncThunk("/get-notes-list/:id", async (noteData, { rejectWithValue }) => {
  try {
    const response = await axios.put(`https://682fe255f504aa3c70f587cc.mockapi.io/notes/get-notes-list/${noteData.id}`, noteData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response update online", response);

    return response;
  } catch (error) {
    console.error("Error updating note:", error);
    return rejectWithValue(error);
  }
});

// delete note
export const deleteNoteApi = createAsyncThunk("/get-notes/:id", async (noteId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`https://682fe255f504aa3c70f587cc.mockapi.io/notes/get-notes-list/${noteId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response", response);

    return response;
  } catch (error) {
    console.error("Error deleting note:", error);
    return rejectWithValue(error);
  }
});
