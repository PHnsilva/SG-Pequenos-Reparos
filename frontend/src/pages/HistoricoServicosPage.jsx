import { useState, useEffect } from "react";
import { listarServicos, buscarServicoPorId } from "../services/servicoService";
import { getUserProfile } from "../services/authService";
import ModalDetalhesServico from "../components/ModalDetalhesServico";
import ModalEditarServico from "../components/ModalEditarServicos";
import ModalAvaliacaoServico from "../components/ModalAvaliacaoServico";
import "../styles/pages/HistoricoServicosPage.css";

import Input from "../components/Input";
import Button from "../components/Button";

const HistoricoServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalAvaliacao, setModalAvaliacao] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      const [servicoRes, usuarioRes] = await Promise.all([
        listarServicos(),
        getUserProfile(),
      ]);
      setServicos(servicoRes.data);
      setUsuario(usuarioRes);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const servicosFiltrados = servicos.filter((servico) => {
    const nomeMatch = servico.nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase());
    const statusMatch = filtroStatus ? servico.status === filtroStatus : true;
    const tipoMatch = filtroTipo
      ? typeof servico.tipoServico === "string"
        ? servico.tipoServico === filtroTipo
        : servico.tipoServico?.nome === filtroTipo
      : true;
    const dataMatch = filtroData
      ? servico.data?.includes?.(filtroData) ||
        new Date(servico.data).toLocaleDateString().includes(filtroData)
      : true;
    return nomeMatch && statusMatch && tipoMatch && dataMatch;
  });

  const tiposUnicos = Array.from(
    new Set(
      servicos.map((s) =>
        typeof s.tipoServico === "string" ? s.tipoServico : s.tipoServico?.nome
      )
    )
  );

  const handleEditar = async (servico) => {
    try {
      const res = await buscarServicoPorId(servico.id);
      setServicoSelecionado(res.data);
      setModalEditar(true);
    } catch (err) {
      alert("Erro ao buscar dados completos do serviço para edição.");
      console.error(err);
    }
  };

  const handleFecharModal = () => {
    setServicoSelecionado(null);
    setModalEditar(false);
  };

  const handleAvaliar = (servico) => {
    setServicoSelecionado(servico);
    setModalAvaliacao(true);
  };

  return (
    <div className="historico-page">
      <h2 className="historico-titulo">Histórico de Serviços</h2>
      <div className="box-listagem-historico">
        {/* Filtros */}
        <div className="historico-filtros">
          <Input
            labelClassName="label-white"
            type="text"
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <Input
            labelClassName="label-white"
            type="text"
            placeholder="Filtrar por data (dd/mm/aaaa)"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
          <select
            className="filtro"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="SOLICITADO">Solicitado</option>
            <option value="ACEITO">Agendado</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="RECUSADO">Recusado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <select
          className="filtro"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Serviços */}
        {servicosFiltrados.length === 0 ? (
          <p className="historico-vazio">
            Nenhum serviço encontrado com os filtros aplicados.
          </p>
        ) : (
          <ul className="historico-lista">
            {servicosFiltrados.map((servico) => (
              <li key={servico.id} className="historico-card">
                <h4>{servico.nome}</h4>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {typeof servico.tipoServico === "string"
                    ? servico.tipoServico
                    : servico.tipoServico?.nome}
                </p>
                <p>
                  <strong>Status:</strong> {servico.status}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {servico.data
                    ? new Date(servico.data).toLocaleDateString()
                    : "Não agendado"}
                </p>
                {usuario?.tipo === "CLIENTE" && servico.administradorNome && (
                  <p>
                    <strong>Prestador:</strong> {servico.administradorNome}
                  </p>
                )}
                {usuario?.tipo === "ADMIN" && servico.clienteNome && (
                  <p>
                    <strong>Cliente:</strong> {servico.clienteNome}
                  </p>
                )}
                <div className="historico-botoes">
                  <Button onClick={() => setServicoSelecionado(servico)}>
                    Detalhes
                  </Button>
                  {usuario?.tipo === "ADMIN" && (
                    <Button
                      variant="editar"
                      onClick={() => handleEditar(servico)}
                    >
                      Editar
                    </Button>
                  )}
                  {usuario?.tipo === "CLIENTE" &&
                    servico.status === "CONCLUIDO" && (
                      <Button
                        variant="avaliar"
                        onClick={() => handleAvaliar(servico)}
                      >
                        Avaliar
                      </Button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Modal de Detalhes */}
        {servicoSelecionado && !modalEditar && !modalAvaliacao && (
          <ModalDetalhesServico
            servico={servicoSelecionado}
            onClose={() => setServicoSelecionado(null)}
            usuario={usuario}
          />
        )}

        {/* Modal de Edição */}
        {modalEditar && servicoSelecionado && (
          <ModalEditarServico
            servico={servicoSelecionado}
            onClose={handleFecharModal}
            onAtualizado={fetchDados}
          />
        )}

        {/* Modal de Avaliação */}
        {modalAvaliacao && servicoSelecionado && (
          <ModalAvaliacaoServico
            isOpen={modalAvaliacao}
            onClose={() => setModalAvaliacao(false)}
            servico={servicoSelecionado}
            onAvaliado={fetchDados}
          />
        )}
      </div>
    </div>
  );
};

export default HistoricoServicosPage;
