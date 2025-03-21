import HeaderBar from "../components/HeaderBar"
import ImageUpscaler from "../components/ImageUpscaler"
import { useState } from "react";
import './NavBar.css'


function NavBar() {
  const [page, setPage] = useState("home"); // Manage active page

  return (
    <div>
      <nav>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("upscaler")}>Image Upscaler</button>
      </nav>

      {page === "home" && <h1>Home Page</h1>}
      {page === "upscaler" && <ImageUpscaler />}
    </div>
  );
}

export default NavBar;
