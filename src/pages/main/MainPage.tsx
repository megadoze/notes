import { Link } from "react-router-dom";
import notes from "../../assets/img/notes.avif";
import "./main.css";

function MainPage() {

  return (
    <>
      <div className="container">
        <h1 style={{ paddingBottom: "10px" }}>Notes</h1>
        <section style={{ textAlign: "center" }}>
          <img src={notes} alt="notes" className="notes-img" />
          <Link to={"/login"} reloadDocument style={{ textDecoration: "none" }}>
            <button className="btn-login">Start Notes</button>
          </Link>
        </section>
      </div>
    </>
  );
}

export default MainPage;
