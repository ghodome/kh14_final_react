
import { HashRouter } from 'react-router-dom';
import Container from './components/Container';
import Menu from './components/Menu';

function App() {
  return (<>
  <HashRouter>
    <Menu/>
    <Container/>
  </HashRouter>
  </>
  );
}

export default App;
