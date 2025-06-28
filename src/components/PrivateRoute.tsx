import { Navigate, useLocation } from "react-router-dom";
import { getExpiresDate } from "../services/localStorage.service";
import { useAuth } from "../context/AuthProvider";

// eslint-disable-next-line react/prop-types
export const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const auth = useAuth();
  const user = auth.user;
  // console.log("user", user);

  const expiresTime = +getExpiresDate();
  const timeNow = new Date().getTime();

  if (timeNow < expiresTime) {
    return children;
  } else {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
};
