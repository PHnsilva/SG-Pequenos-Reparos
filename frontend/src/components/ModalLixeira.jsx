// ModalLixeira.jsx
import React, { useState } from "react";
import "../styles/components/ModalLixeira.css";

const ModalLixeira = ({
  onClose,
  servicosCancelados = [],    // valores padrão
  servicosExcluidos = []
}) => {
  const [aba, setAba] = useState("excluidos"); // "excluidos" ou "cancelados"
  const [filtroTelefone, setFiltroTelefone] = useState("");

  const normalizarTelefone = (t) => (t || "").replace(/^\+55/, "").replace(/\D/g, "");
  const normalizedFilter = normalizarTelefone(filtroTelefone);

  // escolhe o array correto, sempre um array
  const servicosAtivos =
    aba === "cancelados" ? servicosCancelados : servicosExcluidos;

  const servicosAtivosFiltrados = servicosAtivos.filter((s) => {
    if (!normalizedFilter) return true;
    return normalizarTelefone(s.telefoneContato).includes(normalizedFilter);
  });

  return (
    <div className="modal-lixeira-overlay">
      <div className="modal-lixeira">
        <div className="modal-lixeira-header">
          <h3>Lixeira de Serviços</h3>
          <button onClick={onClose} className="btn-fechar">✖</button>
        </div>

        <div className="abas-lixeira">
          <button
            className={`aba-lixeira ${aba === "cancelados" ? "ativa" : ""}`}
            onClick={() => setAba("cancelados")}
          >
            Cancelados
          </button>
          <button
            className={`aba-lixeira ${aba === "excluidos" ? "ativa" : ""}`}
            onClick={() => setAba("excluidos")}
          >
            Excluídos
          </button>
        </div>

        <div className="filtro-telefone-lixeira" style={{ margin: "8px 0" }}>
          <label htmlFor="filtroTelefoneLixeira">Buscar por telefone:</label>
          <input
            id="filtroTelefoneLixeira"
            type="text"
            placeholder="Ex.: 3199... (ignora +55)"
            value={filtroTelefone}
            onChange={(e) => setFiltroTelefone(e.target.value)}
          />
        </div>

        <div className="lista-lixeira">
          {servicosAtivosFiltrados.length === 0 ? (
            <p className="msg-vazio">Nenhum serviço nesta aba.</p>
          ) : (
            servicosAtivosFiltrados.map((servico) => (
              <div key={servico.id} className="card-lixeira">
                <h4>{servico.nome}</h4>
                <p><strong>Status:</strong> {servico.status}</p>
                <p><strong>Telefone:</strong> {servico.telefoneContato}</p>
                <p>{servico.descricao}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalLixeira;
