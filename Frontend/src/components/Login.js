import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserPage from './UserPage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [token, setToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
        email,
        password,
      });

      setToken(response.data.token); // Salva o token para autenticação
    } catch (err) {
      alert('Erro no login. Verifique suas credenciais.');
      console.error(err);
    }
  };

  if (token) {
    // Redireciona para a página do usuário se o login foi bem-sucedido
    return <UserPage token={token} />;
  }

  return (
    <div>
      <h2>Login - App de Segurança</h2>
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

const SignupPopup = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState({});

  // Buscar os termos da versão mais recente da LGPD
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/terms/pegartermos`);
        const termsData = response.data;

        if (termsData && termsData.length > 0) {
          const initialAcceptedTerms = {};
          termsData.forEach((term) => {
            initialAcceptedTerms[term.id] = false; // Nenhum termo é aceito inicialmente
          });

          setTerms(termsData);
          setAcceptedTerms(initialAcceptedTerms);
        } else {
          console.warn('Nenhum termo retornado pelo backend.');
        }
      } catch (err) {
        console.error('Erro ao buscar os termos:', err);
      }
    };

    fetchTerms();
  }, []);

  const handleCheckboxChange = (termId) => {
    setAcceptedTerms((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Obter os IDs dos termos obrigatórios
    const mandatoryTerms = terms.filter((term) => term.mandatory);
    const acceptedMandatory = mandatoryTerms.every((term) => acceptedTerms[term.id]);

    if (!acceptedMandatory) {
      alert('Você deve aceitar todos os termos obrigatórios.');
      return;
    }

    try {
      const acceptedTermsIds = Object.keys(acceptedTerms)
        .filter((termId) => acceptedTerms[termId])
        .map((termId) => parseInt(termId, 10)); // Converte strings para números

      // Criar o usuário no backend
      await axios.post(`${process.env.REACT_APP_API_URL}/users/createUsuario`, {
        name,
        email,
        password,
        acceptedTerms: acceptedTermsIds, // Envia os IDs dos termos aceitos
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

        {/* Exibir os termos */}
        <div>
          <h3>Termos da LGPD</h3>
          {terms.length > 0 ? (
            terms.map((term, index) => (
              <div key={term.id}>
                <input
                  type="checkbox"
                  id={`term-${term.id}`}
                  checked={acceptedTerms[term.id]}
                  onChange={() => handleCheckboxChange(term.id)}
                  required={index < 2} // Os dois primeiros termos são obrigatórios
                />
                <label htmlFor={`term-${term.id}`}>{term.content}</label>
              </div>
            ))
          ) : (
            <p>Carregando termos...</p>
          )}
        </div>

        <button type="submit">Cadastrar</button>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
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
