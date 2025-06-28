import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      navigate("/", {
        replace: true,
        state: location.pathname,
      });
    }, 2000);
  }, []);

  return (
    // <Navigate to={"/"} />
    <div className="container">
      <h1>Page not found!</h1>
      <p>Return to the main page</p>
    </div>
  );
};

export default Page404;
