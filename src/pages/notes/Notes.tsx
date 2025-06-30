import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import config from "../../config.json";
import Note from "./components/Note";
import NoteList from "./components/NoteList";
import { AuthStatus } from "../../components/AuthStatus";
import { getAccessToken, getUserId } from "../../services/localStorage.service";
import { useAuth } from "../../context/AuthProvider";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import "./notes.css";
import { NoteType } from "../../types/note";

const Notes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { logOut } = useAuth();
  const { isMobile } = useAuth();

  const localId = getUserId();

  const { noteId } = useParams();
  const id = Number(noteId);

  const NoteRef = useRef<NoteType | null>(null);

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isNote, setIsNote] = useState<boolean>(false);
  const [isButDisable, setIsButDisable] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const [sortArray, setSortArray] = useState<NoteType[]>([]);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  type ErrorType = { [key: string]: string } | null;
  const [error, setError] = useState<ErrorType>(null);

  const [toggle, setToggle] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  const handleBack = () => {
    setToggle(false);
    setIsFocus(false);
    navigate(`/notes/${localId}/${id}`);
  };

  const apiEndpoint = config.apiEndpoint;

  const http = axios.create();

  http.interceptors.request.use(
    function (config) {
      // Do something before request is sent
      const accessToken = getAccessToken();
      if (accessToken) {
        config.params = { ...config.params, auth: accessToken };
      }
      return config;
    },
    function (error) {
      // Do something with request error
      console.log(error);
      return Promise.reject(error);
    }
  );

  const handleFocus = (e: boolean) => {
    setIsNote(e);
    setIsFocus(false);
  };

  const handleFocusItem = (e: boolean) => {
    setIsFocus(e);
  };

  useEffect(() => {
    if (getAccessToken()) {
      getNotesByUser();
      if (isMobile) {
        setIsFocus(false);
      } else {
        setIsFocus(true);
      }
    } else {
      setLoading(false);
    }
  }, [isMobile]);

  async function getNotesByUser() {
    try {
      const { data } = await http.get(apiEndpoint + `notes/` + ".json", {
        params: {
          orderBy: `"user"`,
          equalTo: `"${localId}"`,
        },
      });

      const notes = Object.values(data) as NoteType[];
      const sortArray =
        notes.length > 0
          ? notes.sort((a, b) => {
              if (a.created_at > b.created_at) {
                return -1;
              }
              if (a.created_at < b.created_at) {
                return 1;
              }
              return 0;
            })
          : [];
      setNotes(sortArray);
      navigate(`${localId}/${sortArray.length > 0 ? sortArray[0]._id : ""}`, {
        replace: true,
      });
    } catch (error: any) {
      console.log(error);
      const { code } = error;
      if (code === "ERR_BAD_REQUEST") {
        logOut();
      }
      errorCatcher(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddNote = async () => {
    if (!localId) return; // безопасный выход, если ID нет

    setSearch("");
    setSortArray([]);
    const randomNum = Math.round(Math.random() * 10000);

    NoteRef.current = {
      _id: randomNum,
      title: "",
      description: "",
      text: "",
      created_at: new Date(),
      user: localId,
    };

    await createNote(NoteRef.current);
    navigate(`${localId}/${NoteRef.current._id}`, { state: location.pathname });

    setIsNote(true);
    setIsButDisable(true);
    if (isMobile) {
      setToggle(true);
    }
  };

  async function createNote(content: NoteType): Promise<NoteType | void> {
    try {
      const { data } = await http.put(
        apiEndpoint + "notes/" + content._id + ".json",
        content
      );
      setNotes((prevState) => [data, ...prevState]);
      return data;
    } catch (error) {
      console.log(error);
      errorCatcher(error);
    }
  }

  function errorCatcher(error: any): void {
    const { code, message } = error.response?.data?.error || {};
    if (code === 400 && message === "INVALID_LOGIN_CREDENTIALS") {
      setError({
        email: "Email or/and password was wrong. Try again!",
      });
    }
  }

  const handleChangeNotes = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const noteValue = e.target.value;
    const findNote = notes.find((note) => note._id === id);

    if (!findNote) return; // выход, если заметка не найдена

    if (noteValue === "") {
      setIsButDisable(true);
      findNote.text = noteValue;
      findNote.title = noteValue;
      const newArray = notes.map((note) => note);
      setNotes(newArray);
      await updateNote(findNote);
      return;
    }

    setIsButDisable(false);
    findNote.text = noteValue;
    const findEnter = noteValue.indexOf("\n");

    if (findEnter > 0) {
      if (findEnter <= 40) {
        findNote.title = noteValue.slice(0, findEnter);
        findNote.description = noteValue.slice(findEnter + 1);
      } else {
        findNote.title = noteValue.slice(0, 40);
        findNote.description = noteValue.slice(41);
      }
    } else {
      findNote.title = noteValue.slice(0, 40);
      findNote.description = noteValue.slice(41);
    }

    const newArray = notes.map((note) => note);
    setNotes(newArray);
    await updateNote(findNote);
  };

  async function updateNote(content: NoteType): Promise<NoteType | void> {
    try {
      const { data } = await http.patch(
        apiEndpoint + "notes/" + content._id + ".json",
        content
      );
      return data;
    } catch (error) {
      // console.log(error);
      errorCatcher(error);
    }
  }

  async function deleteNote(id: number): Promise<void> {
    try {
      const { data } = await http.delete(apiEndpoint + "notes/" + id + ".json");
      close();
      return data;
    } catch (error) {
      // console.log(error);
      errorCatcher(error);
    }
  }

  const findNote = () => {
    const note = notes.find((note) => note._id === id);
    return note;
  };

  const handleDeleteEmptyItem = async (data: {
    from: number;
    this: number;
  }) => {
    setIsButDisable(false);
    const noteData = findNote();

    if (noteData?.text === "") {
      setIsButDisable(true);
      if (data.from !== data.this) {
        const newArray = notes.filter((note) => note._id !== noteData._id);
        navigate(`${localId}/${data.this}`);
        setIsButDisable(false);
        await deleteNote(noteData._id);
        return setNotes(newArray);
      }
    }
  };

  const [opened, { open, close }] = useDisclosure(false);

  const handleModal = () => {
    open();
  };

  const handleDeleteNote = async () => {
    const noteData = findNote();
    if (!noteData) return;

    const newArray = notes.filter((note) => note._id !== noteData._id);
    await deleteNote(noteData._id);

    if (newArray.length > 0) {
      if (search === "") {
        const nextItem = newArray[0]._id;
        navigate(`/notes/${localId}/${nextItem}`);
        setSortArray(newArray);
        return setNotes(newArray);
      } else {
        const newSortArray = sortArray.filter(
          (note) => note._id !== noteData._id
        );

        const nextItem = newSortArray[0] ? newSortArray[0]._id : localId;
        setSortArray(newSortArray);
        navigate(`/notes/${nextItem}`);
        return setNotes(newArray);
      }
    } else {
      navigate(`/notes/${localId}`);
      setIsButDisable(false);
      setSortArray(newArray);
      return setNotes(newArray);
    }
  };

  const handleSearchNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    filterNotes(e.target.value.toUpperCase());
  };

  const filterNotes = (data: string) => {
    const matchNotes = notes.filter((note) =>
      note.text.toUpperCase().includes(data)
    );
    console.log(matchNotes);

    setSortArray(matchNotes);

    if (matchNotes[0]) {
      navigate(`${localId}/${matchNotes[0]._id}`);
    } else {
      navigate(`/notes/${localId}`);
    }
  };

  const visibleForm = () => {
    if (search) {
      if (sortArray.length > 0) {
        return (
          <Note
            isNote={isNote}
            notes={sortArray}
            onChangeNotes={handleChangeNotes}
            onFocus={handleFocus}
          />
        );
      } else {
        return <></>;
      }
    } else if (notes.length > 0) {
      return (
        <Note
          isNote={isNote}
          notes={notes}
          onChangeNotes={handleChangeNotes}
          onFocus={handleFocus}
        />
      );
    } else {
      return <></>;
    }
  };

  const handleToggle = (data: { status: boolean; id: number }) => {
    setToggle(data.status);
    setToggle(true);
  };

  return (
    <>
      {!isLoading ? (
        <main className="notes-container">
          <Modal opened={opened} onClose={close} title="Delete Note" centered>
            <p style={{ paddingBottom: "10px", color: "#353535" }}>
              Are you sure? Delete this Note?
            </p>
            <button className="btn-modal" onClick={handleDeleteNote}>
              Delete
            </button>
          </Modal>

          {/* MOBILE — только левая колонка */}
          {isMobile && !toggle && (
            <section className="left-col">
              <header className="header">
                <AuthStatus />
                <button
                  onClick={handleModal}
                  className="delete-icon-pos"
                  disabled={notes.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={`size-6 ${
                      notes.length > 0 ? "delete-icon" : "icon-disable"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </header>
              {/* <div className="left-col__date">Today</div> */}
              <div className="scroll-left">
                <NoteList
                  notes={search.length > 0 ? sortArray : notes}
                  NoteRef={NoteRef.current}
                  onDeleteEmptyItem={handleDeleteEmptyItem}
                  search={search}
                  isFocus={isFocus}
                  onChangeFocusItem={handleFocusItem}
                  onToggle={handleToggle}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  position: "fixed",
                  bottom: "0px",
                  borderTop: "1px solid #e0e0e0",
                  width: "100%",
                  height: "60px",
                  backgroundColor: "white",
                }}
              >
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="add-icon-pos--mobile"
                  disabled={isButDisable}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-6 ${
                      isButDisable ? "icon-disable" : "add-icon"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* MOBILE — только правая колонка */}
          {isMobile && toggle && (
            <section className="right-col">
              <header className="header">
                <button
                  style={{
                    marginRight: "auto",
                    paddingLeft: "15px",
                    color: "#ffc123",
                  }}
                  onClick={handleBack}
                >
                  &laquo; Back
                </button>
              </header>
              <div
                className="scroll-right"
                style={{ paddingBottom: "70px", overflowY: "auto" }}
              >
                {visibleForm()}
              </div>
            </section>
          )}

          {/* DESKTOP — обе колонки */}
          {!isMobile && (
            <>
              <section className="left-col">
                <header className="header">
                  <AuthStatus />
                  <button
                    type="button"
                    onClick={handleModal}
                    className="delete-icon-pos"
                    disabled={isButDisable}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className={`size-6 ${
                        notes.length > 0 ? "delete-icon" : "icon-disable"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21
         c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077
         H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0
         a48.108 48.108 0 0 0-3.478-.397m-12 .562
         c.34-.059.68-.114 1.022-.165m0 0
         a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916
         c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0
         c-1.18.037-2.09 1.022-2.09 2.201v.916
         m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </header>
                {/* <div className="left-col__date">Today</div> */}
                <div className="scroll-left">
                  <NoteList
                    notes={search.length > 0 ? sortArray : notes}
                    NoteRef={NoteRef.current}
                    onDeleteEmptyItem={handleDeleteEmptyItem}
                    search={search}
                    isFocus={isFocus}
                    onChangeFocusItem={handleFocusItem}
                    onToggle={handleToggle}
                  />
                </div>
              </section>
              <section className="right-col">
                <header className="header">
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="add-icon-pos"
                    disabled={isButDisable}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`size-6 ${
                        isButDisable ? "icon-disable" : " add-icon"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                  <input
                    value={search}
                    className="searchbox"
                    type="text"
                    placeholder="search note..."
                    onChange={handleSearchNotes}
                    onFocus={() => setIsFocus(false)}
                  />
                </header>
                <div className="scroll-right" style={{ overflowY: "auto" }}>
                  {visibleForm()}
                </div>
              </section>
            </>
          )}
        </main>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default Notes;
