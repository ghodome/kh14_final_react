
// import { HashRouter } from 'react-router-dom';
import Container from './components/Container';
import Menu from './components/Menu';
// import { RecoilRoot, useRecoilState } from 'recoil';


function App() {


  return (<>
    {/* <RecoilRoot>
      <HashRouter> */}
        <Menu />
        <Container />
      {/* </HashRouter>
    </RecoilRoot> */}
  </>
  );
}

export default App;
