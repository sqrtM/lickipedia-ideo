import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/index.scss'
import Feed from './Feed';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Feed />
  </React.StrictMode>,
)
