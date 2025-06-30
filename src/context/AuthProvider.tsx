import axios from "axios";
import { ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";
import config from "../config.json";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getUserId,
  removeAuthData,
  setTokens,
} from "../services/localStorage.service";
import { auth, googleProvider, signInWithPopup } from "../services/firebase";

const httpAuth = axios.create({
  baseURL: "https://identitytoolkit.googleapis.com/v1/",
  params: {
    key: import.meta.env.VITE_FIREBASE_API_KEY,
  },
});

const http = axios.create();
const apiEndpoint = config.apiEndpoint;

http.interceptors.request.use(
  function (config) {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.params = { ...config.params, auth: accessToken };
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const { code } = error;
    if (code === "ERR_BAD_REQUEST") {
      removeAuthData();
    }

    return Promise.reject(error);
  }
);

interface IAuthContext {
  user: any;
  signUp: Function;
  signIn: Function;
  signInWithGoogle: Function;
  logOut: Function;
  error: any;
  isMobile: boolean;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMobile = useMediaQuery("(max-width: 425px)");

  async function signUp({ email, password, ...rest }) {
    const url = `accounts:signUp`;
    try {
      const { data } = await httpAuth.post(url, {
        email,
        password,
        returnSecureToken: true,
      });
      setTokens(data);
      await createUser({ _id: data.localId, email: data.email, ...rest });
      // navigate(`notes/${data.localId}`, { replace: true });
      setError(null);
    } catch (error) {
      errorCatcher(error);
      const { code, message } = error.response.data.error;
      // console.log(code, message);
      if (code === 400) {
        if (message === "EMAIL_EXISTS") {
          setError({
            email: "This email already exist!",
          });
          const errorObj = {
            email: "This email already exist!",
          };
          throw errorObj;
        }
      }
    }
  }

  async function createUser(content) {
    const newData = { ...content, created_at: Date.now() };

    try {
      const { data } = await http.put(
        apiEndpoint + "users/" + content._id + ".json",
        newData
      );
      setUser(data);
    } catch (error) {
      errorCatcher(error);
    }
  }

  async function signIn({ email, password }) {
    const url = `accounts:signInWithPassword`;
    try {
      const { data } = await httpAuth.post(url, {
        email,
        password,
        returnSecureToken: true,
      });
      setTokens(data);
      await getUserData();
      // navigate(`notes/${data.localId}`, { replace: true });
      setError(null);
    } catch (error) {
      errorCatcher(error);
    }
  }

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      setTokens({ idToken: token, localId: user.uid });

      // Проверяем, есть ли пользователь в базе
      const { data } = await http.get(`${apiEndpoint}users/${user.uid}.json`);

      // Если нет — создаём нового
      if (!data) {
        await createUser({
          _id: user.uid,
          email: user.email,
          name: user.email?.split("@")[0] || "user",
        });
      }

      await getUserData();
      setError(null);
    } catch (error) {
      console.error("Google Auth error:", error);
      errorCatcher(error);
    }
  }

  async function getUserData() {
    try {
      const { data } = await http.get(
        apiEndpoint + "users/" + getUserId() + ".json"
      );
      setUser(data);
    } catch (error) {
      errorCatcher(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const logOut = () => {
    removeAuthData();
    setUser(null);
    navigate("/");
  };

  function errorCatcher(error) {
    const { code, message } = error.response.data.error;
    if (code === 400) {
      if (message === "INVALID_LOGIN_CREDENTIALS") {
        setError({
          email: "Email or/and password was wrong. Try again!",
        });
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signInWithGoogle,
        logOut,
        error,
        isMobile: isMobile ?? false,
      }}
    >
      {!isLoading ? children : "Loading..."}
    </AuthContext.Provider>
  );
}
