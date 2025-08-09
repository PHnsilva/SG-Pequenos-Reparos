import { useState, useEffect } from "react";
import ModalDetalhesServico from "../../components/ModalDetalhesServico";
import Button from "../../components/Button";
import "../../styles/pages/MeusAgendamentos.css";

const MeusAgendamentosAdmin = ({ servicos = [] }) => {
  const [filtroData, setFiltroData] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(null);

  // Estado para armazenar orçamentos por serviço: { [id]: valor }
  const [orcamentos, setOrcamentos] = useState({});

  // Filtra por telefone e data e ordena por data e horário
  const normalizarTelefone = (t) => (t || "").replace(/^\+55/, "").replace(/\D/g, "");
  const normalizedFilter = normalizarTelefone(filtroTelefone);

  const servicosFiltrados = servicos
    .filter((s) => (filtroData ? s.data === filtroData : true))
    .filter((s) => {
      if (!normalizedFilter) return true;
      return normalizarTelefone(s.telefoneContato).includes(normalizedFilter);
    })
    .sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`));

  // Atualiza orçamento no estado
  const handleOrcamentoChange = (id, valorStr) => {
    // Permite somente números e ponto decimal
    const valorLimpo = valorStr.replace(/[^0-9.,]/g, "").replace(",", ".");
    const valor = parseFloat(valorLimpo);
    setOrcamentos((prev) => ({
      ...prev,
      [id]: isNaN(valor) ? "" : valor,
    }));
  };

  // Calcula total dos orçamentos para serviços concluídos
  const servicosConcluidos = servicos.filter((s) => s.status === "CONCLUIDO");
  const totalOrcamentos = servicosConcluidos.reduce((acc, s) => {
    const valor = orcamentos[s.id];
    return acc + (typeof valor === "number" ? valor : 0);
  }, 0);

  return (
    <div className="agendamentos-wrapper">
      <h2 className="titulo-agendamentos">Meus Agendamentos e Concluídos</h2>

      <div
        className="filtros-agendamentos"
        style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}
      >
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
          <label htmlFor="filtroTelefoneAg">Filtrar por telefone:</label>
          <input
            id="filtroTelefoneAg"
            type="text"
            placeholder="Ex.: 3199... (ignora +55)"
            value={filtroTelefone}
            onChange={(e) => setFiltroTelefone(e.target.value)}
          />
        </div>
      </div>

      {servicosFiltrados.length === 0 ? (
        <p className="mensagem-vazia">Nenhum serviço agendado ou concluído.</p>
      ) : (
        <div className="lista-agendamentos">
          {servicosFiltrados.map((servico) => {
            const isConcluido = servico.status === "CONCLUIDO";
            return (
              <div
                key={servico.id}
                className={`card-agendamento ${isConcluido ? "concluido" : ""}`}
                style={{ marginBottom: "12px", border: "1px solid #ccc", padding: "12px", borderRadius: "6px" }}
              >
                <div>
                  <h4>{servico.nome}</h4>
                  <p>
                    <strong>Cliente:</strong> {servico.clienteNome}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {servico.telefoneContato}
                  </p>
                  <p>
                    <strong>Data:</strong> {servico.data} às {servico.horario}
                  </p>
                </div>

                <div style={{ marginTop: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <Button onClick={() => setModalDetalhes(servico)}>Ver Detalhes</Button>

                  {/* Campo orçamento visível só se for serviço concluído */}
                  {isConcluido && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label htmlFor={`orcamento-${servico.id}`}>Orçamento (R$):</label>
                      <input
                        id={`orcamento-${servico.id}`}
                        type="text"
                        placeholder="0.00"
                        value={orcamentos[servico.id] ?? ""}
                        onChange={(e) => handleOrcamentoChange(servico.id, e.target.value)}
                        style={{ width: "100px", padding: "4px", borderRadius: "4px", border: "1px solid #aaa" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo */}
      <div
        className="resumo-orcamentos"
        style={{
          marginTop: "24px",
          padding: "12px",
          borderTop: "2px solid #333",
          fontWeight: "bold",
          fontSize: "1.1rem",
        }}
      >
        Serviços Concluídos: {servicosConcluidos.length} <br />
        Total Orçamento: R$ {totalOrcamentos.toFixed(2)}
      </div>

      {modalDetalhes && (
        <ModalDetalhesServico servico={modalDetalhes} onClose={() => setModalDetalhes(null)} />
      )}
    </div>
  );
};

export default MeusAgendamentosAdmin;
