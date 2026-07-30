import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ProfilePage from "../pages/ProfilePage";
import CharactersPage from "../pages/CharactersPage";
import NotesPage from "../pages/NotesPage";
import NPCsPage from "../pages/NPCsPage";
import RulesPage from "../pages/RulesPage";
import VillainsPage from "../pages/VillainsPage";
import MigrationPage from "../pages/MigrationPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/npcs" element={<NPCsPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/villains" element={<VillainsPage />} />
        <Route path="/migration" element={<MigrationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
