import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPage = ({ token }) => {
  const [userData, setUserData] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState([]);
  const [loading, setLoading] = useState(true); // Adiciona estado de carregamento
  const [error, setError] = useState(null); // Adiciona estado para tratar erros

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
        setTermsAccepted(response.data.acceptedTerms);
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setError('Erro ao carregar dados do usuário.');
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchUserData();
  }, [token]);

  const handleDeleteUser = async () => {
    if (window.confirm('Tem certeza de que deseja deletar sua conta?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/users/deleteUser/${userData.id}`);
        alert('Usuário deletado com sucesso.');
        window.location.reload(); // Faz logoff e volta para a página de login
      } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        alert('Erro ao deletar usuário.');
      }
    }
  };

  // Exibe o estado de carregamento ou erros
  if (loading) {
    return <p>Carregando dados do usuário...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Bem-vindo, {userData.name}!</h2>
      <p>Email: {userData.email}</p>

      <h3>Termos aceitos:</h3>
      {termsAccepted.length > 0 ? (
        termsAccepted.map((term) => (
          <div key={term.id}>
            <input type="checkbox" checked disabled />
            <label>{term.content}</label>
          </div>
        ))
      ) : (
        <p>Nenhum termo aceito encontrado.</p>
      )}

      <button onClick={handleDeleteUser} style={{ backgroundColor: 'red', color: 'white' }}>
        Deletar Conta
      </button>
    </div>
  );
};

export default UserPage;
