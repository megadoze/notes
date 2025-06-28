import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { NoteType } from "../../../types/note";


type NoteProps = {
  notes: NoteType[];
  isNote: boolean;
  onChangeNotes: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: (active: boolean) => void;
};

const Note = ({ notes, isNote, onChangeNotes, onFocus }: NoteProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { noteId } = useParams<{ noteId: string }>();

  const id = Number(noteId);
  const note = notes.find((note) => note._id === id);
  const date = note ? format(new Date(note.created_at), "MM/dd/yyyy p") : "";


  // если isNote активна (кнопку Добавить заметку кликнули, тогда форма становится активной)
  // с помощью inputRef мы ссылаемся на форму
  useEffect(() => {
      if (isNote && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNote]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onFocus(e.type === "focus");
  };

  return (
    <article>
      <p className="right-col__date ">{note && date}</p>
      <textarea
        ref={inputRef}
        value={note?.text || ""}
        onChange={onChangeNotes}
        name="note"
        id="note"
        className="textarea-container"
        onBlur={handleFocus}
        onFocus={handleFocus}
        maxLength={4000}
        spellCheck={true}
      ></textarea>
    </article>
  );
};

export default Note;
