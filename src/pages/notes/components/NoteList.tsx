import NoteListItem from "./NoteListItem";
import { NoteType } from "../../../types/note";

type NoteListProps = {
  notes: NoteType[];
  NoteRef: NoteType | null;
  onDeleteEmptyItem: (data: { from: number; this: number }) => void;
  search: string;
  isFocus: boolean;
  onChangeFocusItem: (focus: boolean) => void;
  onToggle: (data: { status: boolean; id: number }) => void;
};


const NoteList = ({
  notes,
  onDeleteEmptyItem,
  search,
  isFocus,
  onChangeFocusItem,
  onToggle,
}: NoteListProps) => {
  return (
    <>
      <ul className="notes-list">
        {notes &&
          notes.map((note) => (
            <NoteListItem
              key={note._id}
              note={note}
              onDeleteEmptyItem={onDeleteEmptyItem}
              search={search}
              isFocus={isFocus}
              onChangeFocusItem={onChangeFocusItem}
              onToggle={onToggle}
            />
          ))}
      </ul>
    </>
  );
};

export default NoteList;
