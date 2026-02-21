import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/global.css' // Importi l-global CSS hna
import { StoreProvider } from './context/StoreContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
)
