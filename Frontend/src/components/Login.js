import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false); // Controla a exibição do popup de cadastro

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
        email,
        password,
      });
      alert('Login bem-sucedido!');
      console.log('Token:', response.data.token);
    } catch (err) {
      alert('Erro no login. Verifique suas credenciais.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>

      {/* Botão para abrir o popup de cadastro */}
      <button onClick={() => setShowSignup(true)}>Criar Conta</button>

      {/* Renderiza o popup de cadastro */}
      {showSignup && <SignupPopup onClose={() => setShowSignup(false)} />}
    </div>
  );
};

// Componente do popup de cadastro
const SignupPopup = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
  
    console.log('Enviando dados para o backend:', { name, email, password });
    console.log()
  
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/createUsuario`, {
        name,
        email,
        password,
      });
      alert('Usuário criado com sucesso!');
      onClose(); // Fecha o popup após o cadastro
    } catch (err) {
      console.error('Erro ao criar usuário:', err.response || err);
      alert('Erro ao criar usuário. Verifique os dados.');
    }
  };

  return (
    <div style={popupStyle}>
      <h2>Criar Conta</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

const popupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '20px',
  backgroundColor: '#fff',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
};

export default Login;
