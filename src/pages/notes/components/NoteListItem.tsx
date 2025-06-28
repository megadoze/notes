import { format } from "date-fns";
import { Link, useLocation, useParams } from "react-router-dom";
import { searchWord } from "../../../utils/searchWord";
import { getUserId } from "../../../services/localStorage.service";
import { useAuth } from "../../../context/AuthProvider";
import { NoteType } from "../../../types/note";


type NoteListItemProps = {
  note: NoteType;
  onDeleteEmptyItem: (data: { from: number; this: number }) => void;
  search: string;
  isFocus: boolean;
  onChangeFocusItem: (focus: boolean) => void;
  onToggle: (data: { status: boolean; id: number }) => void;
};


const NoteListItem = ({
  note,
  onDeleteEmptyItem,
  search,
  isFocus,
  onChangeFocusItem,
  onToggle,
}: NoteListItemProps) => {
  const date = format(new Date(note.created_at), "dd/MM/yyyy");
  const params = useParams<{ noteId: string }>();
  const id = Number(params.noteId);

  const { isMobile } = useAuth();
  const location = useLocation();
  const localId = getUserId();

  const itemStyle = () => {
    return isFocus ? "link-focus" : "link-focus-gray";
  };

  const handleClick = () => {
    onDeleteEmptyItem({ from: id, this: note._id });
    onChangeFocusItem(true);
    if (isMobile) {
      onToggle({ status: true, id: note._id });
    }
  };

  return (
    <li
       className={`notes-list__item notes-list__item-border ${
        id === note._id ? "notes-list__item-border-focus" : ""
      }`}
    >
      <Link
        className={`link ${id === note._id ? itemStyle() : ""}`}
        to={`${localId}/${note._id}`}
        state={{ path: location.pathname, id: id }}
        onClick={handleClick}
      >
        <h2 className="notes-list__item-title">
          {note.title !== ""
            ? search
              ? searchWord(note.title, search)
              : note.title
            : "New Note"}
        </h2>
        <p className="notes-list__item-desc">
          <span className="notes-list__item-desc-date">{date}</span>
          {note.description !== ""
            ? search
              ? searchWord(note.description, search)
              : note.description
            : "No additional text"}
        </p>
        <p className="notes-list__item-folder">Folder</p>
      </Link>
    </li>
  );
};

export default NoteListItem;
