import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 실제 앱과 같은 디자인 토큰·공용 스타일을 써서 색(크림색 강조 등)이 똑같이 보이게 한다
import '../../../index.css'
import { DevApp } from './DevApp'
import { installMockServer } from './mockServer'

const mock = new URLSearchParams(location.search).has('mock')
if (mock) installMockServer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevApp mock={mock} />
  </StrictMode>,
)
