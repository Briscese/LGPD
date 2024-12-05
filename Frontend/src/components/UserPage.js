import React, { useState, useEffect } from "react"
import axios from "axios"

const UserPage = ({ token }) => {
  const [userData, setUserData] = useState(null)
  const [terms, setTerms] = useState([])
  const [acceptedTermIds, setAcceptedTermIds] = useState([]) // Lista de IDs dos termos aceitos
  const [acceptedTermsHistory, setAcceptedTermsHistory] = useState([]) // Histórico de termos aceitos
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updateError, setUpdateError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // Campo de senha
  const [confirmPassword, setConfirmPassword] = useState("") // Campo de confirmação de senha
  const [passwordError, setPasswordError] = useState("") // Erro de confirmação de senha

  useEffect(() => {
    const fetchUserDataAndTerms = async () => {
      try {
        // Buscar os dados do usuário
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserData(userResponse.data)
        setName(userResponse.data.name)
        setEmail(userResponse.data.email)

        // Buscar os termos
        const termsResponse = await axios.get("http://localhost:3000/terms/pegartermos")
        setTerms(termsResponse.data)

        // Definir os IDs dos termos já aceitos pelo usuário
        const acceptedIds = userResponse.data.acceptedTerms.map((term) => term.id)
        setAcceptedTermIds(acceptedIds)
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError("Erro ao carregar dados do usuário e termos.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDataAndTerms()
  }, [token])

  const fetchAcceptedTermsHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/terms/termos-aceitos/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAcceptedTermsHistory(response.data.acceptedTerms) // Atualiza o histórico de termos aceitos
    } catch (err) {
      console.error("Erro ao carregar histórico de termos:", err)
      setError("Erro ao carregar histórico de termos.")
    }
  }

  const handleDeleteUser = async () => {
    if (window.confirm("Tem certeza de que deseja deletar sua conta?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/users/deleteUser/${userData.id}`)
        alert("Usuário deletado com sucesso.")
        window.location.reload()
      } catch (err) {
        console.error("Erro ao deletar usuário:", err)
        alert("Erro ao deletar usuário.")
      }
    }
  }

  const handleUpdateProfile = async () => {
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem. Tente novamente.")
      return
    }

    try {
      // Atualiza os dados do usuário
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/updateUsuario`,
        { name, email, password }, // Passa o nome, email e a senha
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Perfil atualizado com sucesso!")
      setPasswordError("") // Limpa o erro de senha
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      alert("Erro ao atualizar perfil.")
    }
  }

  const handleUpdateTerms = async () => {
    // Remover duplicados usando Set
    const uniqueAcceptedTermIds = [...new Set(acceptedTermIds)]

    // Verifica se todos os termos obrigatórios foram aceitos
    const mandatoryTerms = terms.filter((term) => term.mandatory)
    const mandatoryTermsAccepted = mandatoryTerms.every((term) => uniqueAcceptedTermIds.includes(term.id))

    if (!mandatoryTermsAccepted) {
      setUpdateError("Você deve aceitar todos os termos obrigatórios para continuar.")
      return
    }

    try {
      // Envia a lista única de IDs de termos aceitos ao backend
      await axios.put("http://localhost:3000/terms/atualizartermos", uniqueAcceptedTermIds, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUpdateError("")
      alert("Termos atualizados com sucesso!")
    } catch (err) {
      console.error("Erro ao atualizar termos:", err)
      alert("Erro ao atualizar termos.")
    }
  }

  const handleCheckboxChange = (termId) => {
    setAcceptedTermIds((prevAccepted) => {
      if (prevAccepted.includes(termId)) {
        return prevAccepted.filter((id) => id !== termId) // Remove o ID se o termo for desmarcado
      } else {
        return [...prevAccepted, termId] // Adiciona o ID se o termo for marcado
      }
    })
  }

  const mandatoryTerms = terms.filter((term) => term.mandatory)
  const optionalTerms = terms.filter((term) => !term.mandatory)

  // Exibe o estado de carregamento ou erros
  if (loading) {
    return <p>Carregando dados do usuário...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <h2>Bem-vindo, {userData.name}!</h2>
      <p>Email: {userData.email}</p>

      <h3>Atualizar Perfil:</h3>
      <div>
        <label>
          Nome:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>
          Senha (deixe em branco para não alterar):
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
        </label>
        <br />
        <label>
          Confirmar Senha:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar Senha"
          />
        </label>
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
        <br />
        <button onClick={handleUpdateProfile} style={{ backgroundColor: "blue", color: "white" }}>
          Atualizar Perfil
        </button>
      </div>

      <h3>Histórico de Termos:</h3>
      <button onClick={fetchAcceptedTermsHistory} style={{ backgroundColor: "green", color: "white" }}>
        Ver Histórico de Termos
      </button>

      {acceptedTermsHistory.length > 0 && (
        <table>
          <thead>
            <tr>
{/*               <th>ID do Termo</th> */}
              <th>Conteúdo do Termo</th>
              <th>Data de Aceitação</th>
            </tr>
          </thead>
          <tbody>
            {acceptedTermsHistory.map((term) => (
              <tr key={term.termId}>
{/*                 <td>{term.termId}</td> */}
                <td>{term.termContent}</td>
                <td>{new Date(term.acceptedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Termos obrigatórios:</h3>
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

      <h3>Termos opcionais:</h3>
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

      {updateError && <p style={{ color: "red" }}>{updateError}</p>}
      <button onClick={handleUpdateTerms} style={{ backgroundColor: "blue", color: "white" }}>
        Atualizar Termos
      </button>

      <br />
      <button onClick={handleDeleteUser} style={{ backgroundColor: "red", color: "white" }}>
        Deletar Conta
      </button>
    </div>
  )
}

export default UserPage
