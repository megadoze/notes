import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export function AuthStatus() {
  const auth = useAuth();
  const { logOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logOut();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  if (auth.user) {
    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "dimgray",
            fontSize: "15px",
          }}
        >
          <p style={{ paddingLeft: "15px", fontSize: "14px" }}>
            Welcome, {auth.user?.name}!
          </p>
          <button
            style={{
              border: "1px solid gray",
              borderRadius: "2px",
              padding: "0px 5px",
              marginLeft: "5px",
              color: "dimgray",
              fontSize: "13px",
            }}
            onClick={handleSignOut}
          >
            Log out
          </button>
        </div>
      </>
    );
  } else
    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "dimgray",
            fontSize: "15px",
          }}
        >
          <p style={{ paddingLeft: "15px", fontSize: "14px" }}>
            You are not login
          </p>
          <button
            style={{
              border: "1px solid gray",
              borderRadius: "2px",
              padding: "0px 5px",
              marginLeft: "5px",
              color: "dimgray",
              fontSize: "13px",
            }}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </>
    );
}
