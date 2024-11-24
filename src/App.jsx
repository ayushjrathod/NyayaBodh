import "boxicons";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Layout from "./components/Layout/Layout";
import Chatbot from "./pages/Chatbot";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import HomeSearch from "./pages/HomeSearch";
import Recommend from "./pages/Recommend";
import Resources from "./pages/Resources";

const App = () => {
  return (
    <RecoilRoot>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}

          {/* Main Routes */}
          <Route path="/" element={<HomeSearch />} />
          <Route path="/results" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/chatbot/:id" element={<Chatbot />} />
          <Route path="/recommend" element={<Layout />}>
            <Route index element={<Recommend />} />
          </Route>
          <Route path="/resources" element={<Layout />}>
            <Route index element={<Resources />} />
          </Route>
          <Route path="/contact" element={<Layout />}>
            <Route index element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </RecoilRoot>
  );
};

export default App;
