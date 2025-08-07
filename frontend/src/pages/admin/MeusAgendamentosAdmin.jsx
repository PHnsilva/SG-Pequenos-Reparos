import { useState } from "react";
import ModalDetalhesServico from "../../components/ModalDetalhesServico";
import Button from "../../components/Button";
import "../../styles/pages/MeusAgendamentos.css";

const normalizarTelefone = (t = "") =>
  String(t).replace(/\D/g, "").replace(/^55/, "");

const MeusAgendamentosAdmin = ({ servicos = [] }) => {
  const [filtroData, setFiltroData] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(null);

  // usa prop servicos em vez de fetch interno
  const servicosAgendados = servicos.filter((s) => s.status === "ACEITO");

  const servicosFiltrados = servicosAgendados
    .filter((s) => (filtroData ? s.data === filtroData : true))
    .filter((s) =>
      filtroTelefone
        ? normalizarTelefone(s.telefoneContato).includes(
            normalizarTelefone(filtroTelefone)
          )
        : true
    )
    .sort(
      (a, b) =>
        new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`)
    );

  return (
    <div className="agendamentos-wrapper">
      <h2 className="titulo-agendamentos">Agendamentos</h2>

      <div className="filtro-controles">
        <div className="filtro-data">
          <label htmlFor="filtroData">Filtrar por data:</label>
          <input
            type="date"
            id="filtroData"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>

        <div className="filtro-telefone">
          <label htmlFor="filtroTelefone">Filtrar por telefone:</label>
          <input
            id="filtroTelefone"
            type="text"
            placeholder="Ex: 3199..."
            value={filtroTelefone}
            onChange={(e) => setFiltroTelefone(e.target.value)}
          />
          {filtroTelefone && (
            <Button onClick={() => setFiltroTelefone("")}>Limpar</Button>
          )}
        </div>
      </div>

      {servicosFiltrados.length === 0 ? (
        <p className="mensagem-vazia">Nenhum serviço agendado.</p>
      ) : (
        <div className="lista-agendamentos">
          {servicosFiltrados.map((servico) => (
            <div key={servico.id} className="card-agendamento">
              <div>
                <h4>{servico.nome}</h4>
                <p>
                  <strong>Cliente:</strong> {servico.clienteNome}
                </p>
                <p>
                  <strong>Telefone:</strong> {servico.telefoneContato || "—"}
                </p>
                <p>
                  <strong>Data:</strong> {servico.data} às {servico.horario}
                </p>
              </div>
              <Button onClick={() => setModalDetalhes(servico)}>
                Ver Detalhes
              </Button>
            </div>
          ))}
        </div>
      )}

      {modalDetalhes && (
        <ModalDetalhesServico
          servico={modalDetalhes}
          onClose={() => setModalDetalhes(null)}
        />
      )}
    </div>
  );
};

export default MeusAgendamentosAdmin;
