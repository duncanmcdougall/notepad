export default (version: string) => {
  if(version >= "v0.2.0") {
    return;
  }

  if(!localStorage.getItem("notes")) {
    return;
  }
  const notes = JSON.parse(localStorage.getItem("notes")) as { id: string }[];
  console.log(`Migrating ${notes.length} from ${version} to v0.2.0`);
  notes.map(note => {
    const newId = `note${note.id}`
    localStorage.setItem(newId, JSON.stringify({
      ...note,
      id: newId
    }));
  });
  localStorage.removeItem("notes");
  console.log(`Migrated ${notes.length} from ${version} to v0.2.0`);
}