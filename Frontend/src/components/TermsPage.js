import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Para acessar o estado da navegação
import axios from 'axios';

const TermsPage = () => {
  const [terms, setTerms] = useState([]); // Para armazenar os termos disponíveis
  const [acceptedTermIds, setAcceptedTermIds] = useState([]); // IDs dos termos aceitos
  const [updateError, setUpdateError] = useState(''); // Para armazenar erros

  const location = useLocation(); // Pega a localização atual
  const token = location.state?.token; // Acessa o token do estado

  // Busca os termos disponíveis assim que a página é carregada
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/terms/pegartermos');
        setTerms(response.data);
      } catch (error) {
        console.error('Erro ao buscar termos:', error);
        setUpdateError('Erro ao carregar termos.');
      }
    };

    fetchTerms();
  }, []);

  // Atualiza a lista de termos aceitos quando o checkbox for clicado
  const handleCheckboxChange = (termId) => {
    setAcceptedTermIds((prevAccepted) => {
      if (prevAccepted.includes(termId)) {
        return prevAccepted.filter((id) => id !== termId); // Remove o ID se o termo for desmarcado
      } else {
        return [...prevAccepted, termId]; // Adiciona o ID se o termo for marcado
      }
    });
  };

  // Função para aceitar os termos e enviar o PUT
  const handleAcceptTerms = async () => {
    // Verifica se todos os termos obrigatórios foram aceitos
    const mandatoryTermsAccepted = terms
      .filter((term) => term.mandatory)
      .every((term) => acceptedTermIds.includes(term.id));

    if (!mandatoryTermsAccepted) {
      setUpdateError('Você precisa aceitar todos os termos obrigatórios.');
      return;
    }

    try {
      // Envia o PUT com os IDs dos termos aceitos
      await axios.put('http://localhost:3000/terms/atualizartermos', acceptedTermIds, {
        headers: { Authorization: `Bearer ${token}` }, // Adiciona o token no cabeçalho para autenticação
      });

      // Redireciona após a aceitação dos termos
      window.location.href = '/'; // Redireciona para a página de login ou página inicial
    } catch (error) {
      console.error('Erro ao atualizar termos:', error);
      setUpdateError('Erro ao aceitar os termos.');
    }
  };

  // Separar os termos obrigatórios dos opcionais
  const mandatoryTerms = terms.filter((term) => term.mandatory);
  const optionalTerms = terms.filter((term) => !term.mandatory);

  return (
    <div>
      <h2>Termos de Serviço</h2>
      <p>🤚🙅‍♂️🙅‍♀️🛑 PARADO AÍ, AMIGÃO!!! OS TERMOS FORAM ATUALIZADOS, concorde com eles novamente caso queira acessar nossa aplicação.</p>

      {/* Exibe os termos obrigatórios */}
      <div>
        <h3>Termos Obrigatórios</h3>
        {mandatoryTerms.length > 0 ? (
          mandatoryTerms.map((term) => (
            <div key={term.id}>
              <input
                type="checkbox"
                checked={acceptedTermIds.includes(term.id)} // Marca se o ID está na lista de aceitos
                onChange={() => handleCheckboxChange(term.id)} // Atualiza a lista de IDs aceitos
              />
              <label>{term.content}</label>
            </div>
          ))
        ) : (
          <p>Nenhum termo obrigatório disponível.</p>
        )}
      </div>

      {/* Exibe os termos opcionais */}
      <div>
        <h3>Termos Opcionais</h3>
        {optionalTerms.length > 0 ? (
          optionalTerms.map((term) => (
            <div key={term.id}>
              <input
                type="checkbox"
                checked={acceptedTermIds.includes(term.id)} // Marca se o ID está na lista de aceitos
                onChange={() => handleCheckboxChange(term.id)} // Atualiza a lista de IDs aceitos
              />
              <label>{term.content}</label>
            </div>
          ))
        ) : (
          <p>Nenhum termo opcional disponível.</p>
        )}
      </div>

      {/* Exibe o erro caso aconteça algum problema */}
      {updateError && <p style={{ color: 'red' }}>{updateError}</p>}

      {/* Botão para aceitar os termos e redirecionar */}
      <button onClick={handleAcceptTerms} style={{ backgroundColor: 'blue', color: 'white' }}>
        Aceitar e Voltar ao Login
      </button>
    </div>
  );
};

export default TermsPage;
