import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';
import App from './App.tsx'

const Root = () => (
    <MaxUI>
       <StrictMode>
        <App />
      </StrictMode>
    </MaxUI>
)

export default Root;

createRoot(document.getElementById('root')!).render(<Root />)
