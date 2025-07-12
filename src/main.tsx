import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "@/assets/css/index.css"
import "./i18n.ts"

createRoot(document.getElementById("root")!).render(<App />);
