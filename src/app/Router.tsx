import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ProfilePage from "../pages/ProfilePage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile/*" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}