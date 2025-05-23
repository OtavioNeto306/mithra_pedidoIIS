import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error("Failed to find the root element")
  document.body.innerHTML = "<div>Error: Could not find root element. Please check your HTML file.</div>"
} else {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
