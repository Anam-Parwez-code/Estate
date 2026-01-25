import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";

export default function AppInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) return; // not logged in
        const data = await res.json();
        dispatch(signInSuccess(data));
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchUser();
  }, [dispatch]);

  return null; // ye component UI render nahi karta
}
