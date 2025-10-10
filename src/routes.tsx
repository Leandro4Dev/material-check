import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { Report } from './Report'

export function AppRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index Component={App} />
        <Route path="/report" Component={Report} />
      </Routes>
    </BrowserRouter>
  )
}
