import { Link } from 'react-router-dom';
import './Home.css'


const Home = () => {
  return (
    <div className="home">
  <h1>MathRaining</h1>
      <div className="home-list">
        <Link className="home-card" to="/arithmetic/game">
          <div>
            <strong>Arithmetic</strong>
            <div className="sub">Sum, Subtract, Multiply, Divide</div>
          </div>
          <span>Start →</span>
        </Link>
        <Link className="home-card" to="/calculus/game">
          <div>
            <strong>Calculus</strong>
            <div className="sub">Derivatives basics</div>
          </div>
          <span>Start →</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
