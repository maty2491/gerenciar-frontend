import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getMe, logoutUser as apiLogout } from "../services/api";
import { auth, firebaseConfigError, hasFirebaseConfig } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState("loading");
  const [authError, setAuthError] = useState("");

  const clearProfile = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const refreshProfile = async () => {
    if (!auth?.currentUser) {
      clearProfile();
      setProfileStatus("anonymous");
      return null;
    }

    try {
      const profile = await getMe();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      setProfileStatus("ready");
      setAuthError("");
      return profile;
    } catch (error) {
      clearProfile();

      if (error.status === 403 && error.message === "El usuario no tiene perfil asignado") {
        setProfileStatus("pending-profile");
      } else if (error.status === 401) {
        setProfileStatus("anonymous");
        await signOut(auth);
      } else {
        setProfileStatus(error.status === 403 ? "denied" : "error");
      }

      setAuthError(error.message || "No se pudo cargar el perfil.");
      throw error;
    }
  };

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false);
      setProfileStatus("config-error");
      setAuthError(firebaseConfigError);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setLoading(true);
      setFirebaseUser(currentFirebaseUser);

      if (!currentFirebaseUser) {
        clearProfile();
        setProfileStatus("anonymous");
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        // El estado visible ya se actualiza dentro de refreshProfile.
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    if (!auth) {
      throw new Error(firebaseConfigError || "Firebase no esta configurado.");
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      return refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (auth?.currentUser) {
        await apiLogout().catch(() => null);
        await signOut(auth);
      }
    } finally {
      clearProfile();
      setFirebaseUser(null);
      setProfileStatus("anonymous");
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      authError,
      firebaseUser,
      loading,
      login,
      logout,
      profileStatus,
      refreshProfile,
      user,
    }),
    [authError, firebaseUser, loading, profileStatus, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
