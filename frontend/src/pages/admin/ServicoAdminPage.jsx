import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarioServicosAdmin from "../../components/admin/CalendarioServicosAdmin";
import ListaServicosAdmin from "../../components/admin/ListaServicosAdmin";
import { listarServicos } from "../../services/servicoService";
import Button from "../../components/Button";
import "../../styles/pages/ServicosPage.css";

const STATUS_ABAS = [
  { codigo: "ACE", label: "Aceitos", icon: "" },
  { codigo: "CON", label: "Concluídos", icon: "" },
  { codigo: "CAN", label: "Cancelados", icon: "" },
  { codigo: "REC", label: "Recusados", icon: "" },
];

const ServicoAdminPage = () => {
  const [servicos, setServicos] = useState([]);
  const [statusSelecionado, setStatusSelecionado] = useState("ACE");

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const response = await listarServicos();
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  const handleServicoAtualizado = () => {
    fetchServicos();
  };

  const servicosFiltrados = servicos.filter(s => s.status === statusSelecionado);

  return (
    <div className="servicos-page-container">
      {/* Calendário */}
      <div className="servicos-calendar">
        <CalendarioServicosAdmin servicos={servicos} />
      </div>

      {/* Painel Admin */}
      <div className="servicos-content">
        {/* Título */}
        <h2 className="titulo-servicos">Gerenciamento de Serviços</h2>

        {/* Abas de status */}
        <div className="abas-container">
          {STATUS_ABAS.map(({ codigo, label, icon }) => (
            <button
              key={codigo}
              className={`aba-button ${statusSelecionado === codigo ? "ativa" : ""}`}
              onClick={() => setStatusSelecionado(codigo)}
            >
              <span className="aba-icon">{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="servicos-lista">
          {servicosFiltrados.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum serviço com status {statusSelecionado}.
            </p>
          ) : (
            <ListaServicosAdmin
              servicos={servicosFiltrados}
              onServicoAtualizado={handleServicoAtualizado}
            />
          )}
        </div>

        {/* Botões */}
        <div className="servicos-buttons">
          <Link
            to="/cliente/historico"
            className="btn-component btn-link-button"
          >
            Histórico de Serviços
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicoAdminPage;
