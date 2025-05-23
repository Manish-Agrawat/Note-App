import { openDB } from "idb";

const dbName = "notes";
const storeName = "notesStore";

const initDB = async () => {
  return openDB(dbName, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("deletedNotes")) {
        db.createObjectStore("deletedNotes", { keyPath: "id" });
      }
    },
  });
};

export const addNoteToDb = async (note) => {
  const db = await initDB();
  const syncedValue = navigator.onLine ? true : false;
  const created = note.createdAt || new Date().toISOString();
  const id = note.id || crypto.randomUUID();
  const result = await db.put(storeName, { ...note, synced: syncedValue, createdAt: created, id: id });
  return result;
};

export const getAllNotesFromDb = async () => {
  const db = await initDB();
  return await db.getAll(storeName);
};

export const deleteNoteFromDb = async (id) => {
  const db = await initDB();
  await db.delete(storeName, id);
};

//  this is for the remober whiche one is deleted in offline mode

export const addToDeletedQueue = async (note) => {
  const db = await initDB();
  await db.put("deletedNotes", note);
};

export const getDeletedNotesFromDb = async () => {
  const db = await initDB();
  return await db.getAll("deletedNotes");
};

export const removeFromDeletedQueue = async (id) => {
  const db = await initDB();
  await db.delete("deletedNotes", id);
};

export const updateNoteInDb = async (note) => {
  console.log("note", note);
  const db = await initDB();

  const result = await db.put(storeName, { ...note, synced: false, updatedAt: new Date().toISOString() });
  return result;
};

export const markNoteAsSynced = async (id) => {
  const db = await initDB();
  const note = await db.get(storeName, id);
  if (note) {
    note.synced = true;
    await db.put(storeName, note);
  }
};
