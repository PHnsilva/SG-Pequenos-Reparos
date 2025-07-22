import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Button from "../components/Button";
import EditUserModal from "../components/EditUserModal";
import UserField from "../components/UserField";
import "../styles/pages/PerfilPage.css";

const Perfil = () => {
  const { user, username, logout } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Tem certeza que deseja sair?");
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <div className="perfil-page-container">
      <div className="perfil-box-form">
        <h1 className="perfil-box-title">Perfil de {username}</h1>

        {user ? (
          <div className="perfil-user-info">
            <UserField className="user-info" label="Nome" value={user.nome} />
            <UserField className="user-info" label="Email" value={user.email} />
            <UserField className="user-info" label="Telefone" value={user.telefone} />
          </div>
        ) : (
          <p className="perfil-loading">Carregando dados do usuário...</p>
        )}

        <div className="perfil-buttons">
          <Button variant="sair" onClick={handleLogout}>Sair</Button>
          <Button variant="editar" onClick={() => setIsModalOpen(true)}>Editar</Button>
        </div>
      </div>

      {isModalOpen && (
        <EditUserModal user={user} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Perfil;
