import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/index.scss'
import Feed from './Feed';
import 'react-tooltip/dist/react-tooltip.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Feed />
  </React.StrictMode>,
)
