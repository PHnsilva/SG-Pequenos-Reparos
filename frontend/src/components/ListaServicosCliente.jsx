import { useState, useEffect } from "react";
import { cancelarServico } from "../services/servicoService";
import { getUserProfile } from "../services/authService";
import CardServico from "./CardServico";
import ModalAvaliacaoServico from "./ModalAvaliacaoServico";
import Button from "./Button";
import "../styles/components/ListaServicos.css";
import { toast } from "react-toastify";
import ModalCancelarServico from "./ModalCancelarServico";

const ListaServicosCliente = ({ servicos, onServicoAtualizado }) => {
  const [meusServicos, setMeusServicos] = useState([]);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [modalAvaliacao, setModalAvaliacao] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const perfil = await getUserProfile();
        setMeusServicos(servicos.filter(s => s.clienteId === perfil.id));
      } catch (err) {
        console.error("Erro ao filtrar serviços do cliente:", err);
      }
    })();
  }, [servicos]);

  const iniciarCancelamento = (id) => {
    setIdSelecionado(id);
    setMostrarModalCancelar(true);
  };

  const confirmarCancelamento = async (motivo) => {
    setCancelando(true);
    try {
      await cancelarServico(idSelecionado, motivo);
      toast.success("Serviço cancelado com sucesso!");
      onServicoAtualizado();
    } catch {
      toast.error("Erro ao cancelar serviço.");
    } finally {
      setCancelando(false);
      setMostrarModalCancelar(false);
      setIdSelecionado(null);
    }
  };

  const handleAvaliar = (servico) => {
    setServicoSelecionado(servico);
    setModalAvaliacao(true);
  };

  const renderServico = (servico, tipo) => (
    <div key={servico.id} className="lista-servicos-card">
      <CardServico servico={servico} tipo={tipo} />

      {tipo === "solicitado" && (
        <Button
          variant="cancelar"
          onClick={() => iniciarCancelamento(servico.id)}
          disabled={cancelando}
        >
          Cancelar
        </Button>
      )}

      {tipo === "concluido" && (
        <Button variant="avaliar" onClick={() => handleAvaliar(servico)}>
          Avaliar
        </Button>
      )}
    </div>
  );

  const solicitados = meusServicos.filter(s => s.status === "SOLICITADO");
  const agendados = meusServicos.filter(
    s => s.status === "ACEITO" && s.diaEspecifico && s.horario
  );
  const concluidos = meusServicos.filter(s => s.status === "CONCLUIDO");

  return (
    <div className="lista-servicos-container">
      <h2 className="lista-servicos-titulo">Minhas Solicitações</h2>

      <section className="lista-servicos-bloco">
        <h3 className="lista-servicos-subtitulo">Serviços Solicitados</h3>
        <div className="lista-servicos-scroll">
          {solicitados.length === 0
            ? <p className="lista-servicos-vazio">Você não tem serviços solicitados.</p>
            : solicitados.map(s => renderServico(s, "solicitado"))
          }
        </div>
      </section>

      <section className="lista-servicos-bloco">
        <h3 className="lista-servicos-subtitulo">Serviços Agendados</h3>
        <div className="lista-servicos-scroll">
          {agendados.length === 0
            ? <p className="lista-servicos-vazio">Você não tem serviços agendados.</p>
            : agendados.map(s => renderServico(s, "agendado"))
          }
        </div>
      </section>

      <section className="lista-servicos-bloco">
        <h3 className="lista-servicos-subtitulo">Serviços Concluídos</h3>
        <div className="lista-servicos-scroll">
          {concluidos.length === 0
            ? <p className="lista-servicos-vazio">Você ainda não tem serviços concluídos.</p>
            : concluidos.map(s => renderServico(s, "concluido"))
          }
        </div>
      </section>

      {modalAvaliacao && servicoSelecionado && (
        <ModalAvaliacaoServico
          isOpen={modalAvaliacao}
          onClose={() => setModalAvaliacao(false)}
          servico={servicoSelecionado}
          onAvaliado={onServicoAtualizado}
        />
      )}

      {mostrarModalCancelar && (
        <ModalCancelarServico
          onConfirmar={confirmarCancelamento}
          onClose={() => setMostrarModalCancelar(false)}
          loading={cancelando}
        />
      )}
    </div>
  );
};

export default ListaServicosCliente;
