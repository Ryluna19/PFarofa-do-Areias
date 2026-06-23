import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import DemoLayout from "./pages/DemoLayout";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <CarrinhoProvider>
          <Routes>
            <Route path="/*" element={<DemoLayout />} />
          </Routes>
        </CarrinhoProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;