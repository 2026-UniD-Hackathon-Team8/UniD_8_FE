import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DevApp } from './DevApp'
import { installMockServer } from './mockServer'

const mock = new URLSearchParams(location.search).has('mock')
if (mock) installMockServer()

document.body.style.margin = '0'
document.body.style.background = '#020f10'
document.body.style.fontFamily = 'Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevApp mock={mock} />
  </StrictMode>,
)
