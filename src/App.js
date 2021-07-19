import Home from "./pages/Home";
import CityList from "./pages/CityList";
import Map from "./pages/Map";
import HouseDetail from "./pages/HouseDetail";
import Login from "./pages/Login";

import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Route path="/" exact render={() => <Redirect to="/home" />} />
        <Route path="/home" component={Home}></Route>
        <Route path="/citylist" component={CityList}></Route>
        <Route path="/map" component={Map} />
        <Route path="/detail/:id" component={HouseDetail} />
        <Route path="/login" component={Login} />
      </div>
    </Router>
  );
}

export default App;
