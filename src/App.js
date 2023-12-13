import { BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";

import "./App.css";

function App() {
  console.log("ASDFASDF");
  return (
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
}

export default App;
