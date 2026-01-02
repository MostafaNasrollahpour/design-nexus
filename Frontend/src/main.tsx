import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./features/media/components/pretty_alert";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

import "./styles/font.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        fontFamily: "Vazir, sans-serif",
        headings: { fontFamily: "Vazir, sans-serif" },
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);
