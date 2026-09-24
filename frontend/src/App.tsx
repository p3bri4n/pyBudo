
import './App.css'
import AppRouter from "./pages/Router/AppRouter.tsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {

  return (
      <div className={"App"}>
          <BrowserRouter>
              <Routes>
                  <Route path="/*" element={<AppRouter/>}/>
              </Routes>
          </BrowserRouter>
      </div>
  )
}

export default App
