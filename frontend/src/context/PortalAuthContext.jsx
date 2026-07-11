import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { portalApi, setPortalToken } from "../api/api";

/*
 * The portal is a separate auth space from staff: separate login endpoint,
 * separate token, separate context. Portal pages must never read AuthContext.
 */
const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    portalApi
      .get("/portal/current-client")
      .then((res) => {
        if (!cancelled) setClient(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setClient(null);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setClient(null);
    window.addEventListener("portal-auth:expired", onExpired);
    return () => window.removeEventListener("portal-auth:expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await portalApi.post("/portal/login", { email, password });
    setPortalToken(data.data.accessToken);
    setClient(data.data.client);
    return data.data.client;
  }, []);

  const logout = useCallback(async () => {
    try {
      await portalApi.post("/portal/logout");
    } catch {
      // drop the local session regardless
    }
    setPortalToken(null);
    setClient(null);
  }, []);

  return (
    <PortalAuthContext.Provider value={{ client, booting, login, logout }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export const usePortalAuth = () => useContext(PortalAuthContext);
