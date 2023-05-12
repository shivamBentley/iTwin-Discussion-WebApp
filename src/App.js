import { Route, Switch } from 'react-router-dom';
import './App.css';
import List from './components/List';
import Test from "./components/Test";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route strict exact path="/">
          <List />
        </Route>
        <Route strict exact path="/test">
          <Test />
        </Route>
      </Switch>

    </div>
  );
}

export default App;
