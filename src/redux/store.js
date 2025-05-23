import { configureStore } from "@reduxjs/toolkit";
import NotesSlice from "./NotesSlice";

const store = configureStore({
  reducer: {
    getAllNotes: NotesSlice,
  },
});

export default store;
