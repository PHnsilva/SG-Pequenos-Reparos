import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ModalDetalhesServico from "./ModalDetalhesServico";
import "../styles/components/CalendarioServicos.css";
import { getUserProfile } from "../services/authService";
import moment from "moment-timezone";
import "moment/locale/pt-br";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const CalendarioServicos = ({ servicos }) => {
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [meusServicos, setMeusServicos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserProfile();
        const filtrados = servicos.filter(
          (s) => s.clienteId === user.id && s.status === "ACEITO" && s.diaEspecifico && s.horario
        );
        setMeusServicos(
          filtrados.sort((a, b) => {
            const da = new Date(`${a.diaEspecifico}T${a.horario}`);
            const db = new Date(`${b.diaEspecifico}T${b.horario}`);
            return da - db;
          })
        );
      } catch (err) {
        console.error("Erro ao carregar serviços do cliente:", err);
      }
    })();
  }, [servicos]);

  const eventos = meusServicos.map((s) => {
    const [year, month, day] = s.diaEspecifico.split("-");
    const [hour, minute] = s.horario.split(":");
    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { id: s.id, title: s.nome, start, end, servico: s };
  });

  return (
    <div className="calendario-container">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        onView={setView}
        onNavigate={setDate}
        date={date}
        onSelectEvent={(evt) => setServicoSelecionado(evt.servico)}
        views={{ month: true, agenda: true }}
        // Mantém toolbar para permitir trocar entre mês e agenda
      />

      {/* Lista de cards dos serviços agendados */}
      <div className="lista-agendados">
        {meusServicos.length === 0 ? (
          <p className="mensagem-vazia">Nenhum serviço agendado.</p>
        ) : (
          meusServicos.map((s) => (
            <div key={s.id} className="card-agendado">
              <h4>{s.nome}</h4>
              <p><strong>Data:</strong> {s.diaEspecifico} às {s.horario}</p>
              <button onClick={() => setServicoSelecionado(s)}>Detalhes</button>
            </div>
          ))
        )}
      </div>

      {servicoSelecionado && (
        <ModalDetalhesServico
          servico={servicoSelecionado}
          onClose={() => setServicoSelecionado(null)}
        />
      )}
    </div>
  );
};

export default CalendarioServicos;
