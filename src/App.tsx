import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/main";
import { Notes } from "./pages/notes";
import { Page404 } from "./pages/page404";
import { LoginPage } from "./pages/login";
import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute";
import { MantineProvider } from "@mantine/core";


// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("./sw.js")
//     .then((req) => console.log("Service Worker registreted", req))
//     .catch((err) => console.log("Service Worker not registreted", err));
// }

const App: FC = () => {
  return (
    <>
      <MantineProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <Notes />
                </PrivateRoute>
              }
            >
            <Route path="/notes/:userId" element={<Notes />} />
            <Route path="/notes/:userId/:noteId" element={<Notes />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Page404 />} />
          </Routes>
        </AuthProvider>
      </MantineProvider>
    </>
  );
}

export default App;
