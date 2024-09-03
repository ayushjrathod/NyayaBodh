import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Result from "./pages/FutureResult";
import Chatbot from "./pages/Chatbot";
import Layout from "./components/Layout/Layout";
import Recommend from "./pages/Recommend"
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
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
          <Route path="/chatbot/:id"  >
            <Route index element={<Chatbot />} />
          </Route>
          <Route path="/recommend" element={<Layout/>}>
            <Route index element={<Recommend />} />
          </Route>
          <Route path="/resources" element={<Layout/>}>
            <Route index element={<Resources />} />
          </Route>
          <Route path="/contact" element={<Layout/>}>
            <Route index element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
