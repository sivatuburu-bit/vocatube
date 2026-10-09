import { useEffect, useState } from "react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  function loadNotes() {
    const savedNotes =
      JSON.parse(localStorage.getItem("vocatube-notes")) || [];

    setNotes(savedNotes);
  }

  // EDIT NOTE
  function editNote(note) {
    setEditingId(note.id);
    setEditText(note.note);
  }

  // SAVE EDITED NOTE
  function saveEdit(id) {
    if (!editText.trim()) {
      alert("Note cannot be empty.");
      return;
    }

    const updatedNotes = notes.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          note: editText.trim(),
        };
      }

      return item;
    });

    localStorage.setItem(
      "vocatube-notes",
      JSON.stringify(updatedNotes)
    );

    setNotes(updatedNotes);
    setEditingId(null);
    setEditText("");

    alert("✅ Note updated successfully!");
  }

  // CANCEL EDIT
  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  // DELETE NOTE
  function deleteNote(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {
      return;
    }

    const updatedNotes = notes.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      "vocatube-notes",
      JSON.stringify(updatedNotes)
    );

    setNotes(updatedNotes);
  }

  // CLEAR ALL
  function clearAllNotes() {
    const confirmClear = window.confirm(
      "Are you sure you want to delete all notes?"
    );

    if (!confirmClear) {
      return;
    }

    localStorage.removeItem("vocatube-notes");

    setNotes([]);
  }

  return (
    <section className="notes-page">

      <div className="notes-header">

        <div>
          <p className="notes-label">
            YOUR LEARNING NOTES
          </p>

          <h1>My Notes 📝</h1>
        </div>

        <div className="notes-header-actions">

          <span>
            {notes.length} notes
          </span>

          {notes.length > 0 && (
            <button
              className="clear-notes-button"
              onClick={clearAllNotes}
            >
              🧹 Clear All
            </button>
          )}

        </div>

      </div>

      {notes.length === 0 ? (

        <div className="notes-empty">

          <div className="notes-icon">
            📝
          </div>

          <h2>No notes yet</h2>

          <p>
            Add notes while watching videos and
            they will appear here.
          </p>

        </div>

      ) : (

        <div className="notes-grid">

          {notes.map((item) => (

            <article
              className="note-card"
              key={item.id}
            >

              <div className="note-card-header">

                <span>
                  📝 Note
                </span>

                <small>
                  {item.createdAt}
                </small>

              </div>

              <h3>
                {item.videoTitle}
              </h3>

              <p className="note-channel">
                👤 {item.channel}
              </p>

              {/* EDIT MODE */}

              {editingId === item.id ? (

                <>
                  <textarea
                    className="edit-note-input"
                    value={editText}
                    onChange={(event) =>
                      setEditText(event.target.value)
                    }
                    rows="6"
                    autoFocus
                  />

                  <div className="edit-note-actions">

                    <button
                      type="button"
                      className="save-edit-button"
                      onClick={() =>
                        saveEdit(item.id)
                      }
                    >
                      💾 Save
                    </button>

                    <button
                      type="button"
                      className="cancel-edit-button"
                      onClick={cancelEdit}
                    >
                      ❌ Cancel
                    </button>

                  </div>
                </>

              ) : (

                /* NORMAL MODE */

                <>
                  <div className="note-content">
                    {item.note}
                  </div>

                  <div className="note-actions">

                    <button
                      type="button"
                      className="edit-note-button"
                      onClick={() =>
                        editNote(item)
                      }
                    >
                      ✏️ Edit Note
                    </button>

                    <button
                      type="button"
                      className="delete-note-button"
                      onClick={() =>
                        deleteNote(item.id)
                      }
                    >
                      🗑️ Delete Note
                    </button>

                  </div>
                </>

              )}

            </article>

          ))}

        </div>

      )}

    </section>
  );
}

export default Notes;