import { getAllNotesApi } from "./NotesApi";
import { createSlice } from "@reduxjs/toolkit";

const NotesSlice = createSlice({
  name: "getAllNotes",
  initialState: {
    status: "idle",
    getAllNotes: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllNotesApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getAllNotesApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.getAllNotes = action.payload.data;
        console.log("state.getAllNotes", state.getAllNotes);
      });
  },
});

export default NotesSlice.reducer;
