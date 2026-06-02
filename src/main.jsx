import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { useGLTF } from '@react-three/drei'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes'
import './index.css'

/* Serve Draco decoder locally instead of Google CDN (required for Draco-compressed GLB) */
const DRACO_DECODER_PATH = import.meta.env.BASE_URL + 'draco/gltf/'
useGLTF.setDecoderPath(DRACO_DECODER_PATH)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
