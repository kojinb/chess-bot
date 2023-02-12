import './App.css';
import Board from './Board';

function App() {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <Board />
    </div>
  );
}

export default App;
