

import { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { username, password });
      setResult(res.data.message);
    } catch (err) {
      setResult(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-xl mb-4">good morning Login</h2>
      <input className="border mb-2 p-1" placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input className="border mb-2 p-1" placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleLogin}>Login</button>
      <p className="mt-4">{result}</p>
    </div>
  );
}

export default App;
