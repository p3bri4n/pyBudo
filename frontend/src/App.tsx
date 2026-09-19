
import './App.css'
import {PythonRunner} from "./components/PythonEditor.tsx";
import logoPybudo from "../../assets/logo_pybudo.jpeg"

function App() {

  return (
    <>
      <section>

        <div>
          <img src={logoPybudo}/>
          <PythonRunner/>
        </div>

      </section>
    </>
  )
}

export default App
