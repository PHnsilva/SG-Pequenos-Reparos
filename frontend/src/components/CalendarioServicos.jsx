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

const statusInfo = {
  ACEITO: { color: "#2ecc71", icon: "✅", label: "ACE" },
  CONCLUIDO: { color: "#27ae60", icon: "🏁", label: "CON" },
  CANCELADO: { color: "#e74c3c", icon: "❌", label: "CAN" },
  RECUSADO: { color: "#c0392b", icon: "🚫", label: "REC" },
};

const CustomEvent = ({ event }) => {
  const info = statusInfo[event.status] || {
    color: "#7f8c8d",
    icon: "📄",
    label: "OUT",
  };
  return (
    <div
      className="calendario-evento"
      style={{ backgroundColor: info.color, borderLeft: `5px solid ${info.color}` }}
      title={`${event.title} [${info.label}]`}
    >
      <span>{info.icon}</span>
      <span>
        {event.title} <strong>[{info.label}]</strong>
      </span>
    </div>
  );
};

const LegendaStatus = () => (
  <div className="legenda-status">
    <h4>Legenda de Status</h4>
    <div className="legenda-lista">
      {Object.entries(statusInfo).map(([status, info]) => (
        <div
          key={status}
          className="legenda-item"
          style={{ backgroundColor: info.color }}
        >
          <span>{info.icon}</span>
          <strong>[{info.label}]</strong> {status}
        </div>
      ))}
    </div>
  </div>
);

const CalendarioServicos = ({ servicos }) => {
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [meusServicos, setMeusServicos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUserProfile();
        setMeusServicos(servicos.filter(s => s.clienteId === user.id));
      } catch (err) {
        console.error("Erro ao carregar serviços do cliente:", err);
      }
    })();
  }, [servicos]);

  const eventos = meusServicos
    .filter(
      s =>
        s.diaEspecifico &&
        s.horario &&
        (s.status === "ACEITO" || s.status === "CONCLUIDO")
    )
    .map(s => {
      // monta start e end a partir de diaEspecifico + horário
      const [year, month, day] = s.diaEspecifico.split("-");
      const [hour, minute] = s.horario.split(":");
      const start = new Date(year, month - 1, day, hour, minute);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      return {
        id: s.id,
        title: s.nome,
        start,
        end,
        status: s.status,
        // passa todo o objeto para o modal
        servico: s,
      };
    });

  return (
    <div className="calendario-container">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        components={{ event: CustomEvent }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={evt => setServicoSelecionado(evt.servico)}
        messages={{
          date: "Data",
          time: "Horário",
          event: "Serviço",
          allDay: "Dia inteiro",
          week: "Semana",
          work_week: "Dias úteis",
          day: "Dia",
          month: "Mês",
          previous: "Anterior",
          next: "Próximo",
          yesterday: "Ontem",
          tomorrow: "Amanhã",
          today: "Hoje",
          agenda: "Agenda",
          noEventsInRange: "Nenhum serviço neste período.",
          showMore: total => `+ ver mais (${total})`,
        }}
      />

      <LegendaStatus />

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
