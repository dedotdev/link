import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { TooltipProvider } from "./components/ui/tooltip"
import { getDeployments } from "./deployments/deployments.ts"
import "./global.css"
import { Toaster } from "react-hot-toast"
import { UseInkathonProvider } from "@/provider.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <TooltipProvider>
        <UseInkathonProvider
          appName="link!"
          connectOnInit={false}
          defaultChain={import.meta.env.VITE_DEFAULT_CHAIN}
          deployments={Promise.resolve(getDeployments())}
        >
          <>
            <App />
            <Toaster position="top-center" reverseOrder={false} />
          </>
        </UseInkathonProvider>
      </TooltipProvider>
  </React.StrictMode>,
)
