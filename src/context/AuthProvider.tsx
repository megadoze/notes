import axios from "axios";
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

const httpAuth = axios.create({
  baseURL: "https://identitytoolkit.googleapis.com/v1/",
  params: {
    key: "AIzaSyD8EEchDYE1WOA8UGjZS27zJHxQTeG85So"
    // key: import.meta.env.VITE_FIREBASE_KEY,
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

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
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
    const url = "https://accounts.google.com/o/oauth2/v2/auth";
    try {
      const { data } = await http.get(url, {
        client_id:
          "42294321891-0kj3ks7f1o7qacmjo272qid5r2i2mldp.apps.googleusercontent.com",
        client_secret: "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",
        token_uri: "https://oauth2.googleapis.com/token",
        redirect_uri: "http://localhost:5174/",
        response_type: "token",
        scope: "https://www.googleapis.com/auth/userinfo.profile",
        include_granted_scopes: true,
        flowName: "GeneralOAuthFlow",
        mode: "no-cors",
        // cors: {
        //   origin: "http://localhost:5174",
        //   method: "GET",
        //   responseHeader: "Content-Type",
        //   maxAgeSeconds: 3600,
        // },
      });
      console.log(data);
    } catch (error) {
      console.log(error);
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
        isMobile,
      }}
    >
      {!isLoading ? children : "Loading..."}
    </AuthContext.Provider>
  );
}
