import HeaderComponent from './HeaderComponent'
import { BasicTable } from './BasicTable';

function Main() {
  return (
    <div style={{ height: '100vh' }}>
      <div style={{ height: '15%', width: '100vw', }}>
        <HeaderComponent title={'iTwinjs-core'} />
      </div>
      <div style={{ height: '85%', width: '100vw' }}>
        <BasicTable />

      </div>
    </div>
  )
}

export default Main