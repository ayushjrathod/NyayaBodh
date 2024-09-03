import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Result from "./pages/FutureResult";
import Chatbot from "./pages/Chatbot";
import Layout from "./components/Layout/Layout";
import 'boxicons';

function App() {

  return (
    <>
      <Router>
        <Routes >
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/*Private/Protected Routes */}
          <Route path="/" element={<Layout/>} >
            <Route index element={<Home />} />
          </Route>
          <Route path="/search" element={<Layout />} >
            <Route index element={<Result />} />
          </Route>
          <Route path="/result" element={<Layout />} >
            <Route index element={<Result />} />
          </Route>
          <Route path="/chatbot"  >
            <Route index element={<Chatbot />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
