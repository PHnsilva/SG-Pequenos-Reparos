import { useState, useEffect } from "react";
import { listarServicos } from "../../services/servicoService";
import CalendarioServicosAdmin from "../../components/admin/CalendarioServicosAdmin";
import ListaServicosAdmin from "../../components/admin/ListaServicosAdmin";
import Button from "../../components/Button";
import "../../styles/pages/ServicosPage.css";

const STATUS_ABAS = [
  { codigo: "SOLICITADO", label: "Solicitados", icon: "📝" },
  { codigo: "ACEITO", label: "Agendados", icon: "📅" },
  { codigo: "CONCLUIDO", label: "Concluídos", icon: "✅" },
  { codigo: "CANCELADO", label: "Cancelados", icon: "❌" },
];

const ServicoAdminPage = () => {
  const [servicos, setServicos] = useState([]);
  const [viewMode, setViewMode] = useState("servicos"); // 'servicos' | 'calendario' | 'historico'
  const [statusSelecionado, setStatusSelecionado] = useState("SOLICITADO");

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
    <div className="servicos-page-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => toggleView("calendario")}>
          <span className="icon">📅</span>
          <span className="label">Calendário</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("historico")}>
          <span className="icon">🕘</span>
          <span className="label">Histórico</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("servicos")}>
          <span className="icon">📋</span>
          <span className="label">Serviços</span>
        </div>
      </div>

      {/* Painel Admin */}
      <div className="servicos-content">
        {/* Título */}
        <h2 className="titulo-servicos">Gerenciamento de Serviços</h2>

            {/* Abas de Status */}
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
                  onServicoAtualizado={fetchServicos}
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
