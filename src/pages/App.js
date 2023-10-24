import logo from './../logo.svg';
import './../css/pages/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href={`${process.env.REACT_APP_OAUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&scope=repo`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Login to GitHub
        </a>
      </header>
    </div>
  );
}

export default App;
