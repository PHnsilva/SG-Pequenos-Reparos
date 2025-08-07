// CalendarioServicosAdmin.jsx
import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ModalDetalhesServico from "../ModalDetalhesServico";
import { getItinerario } from "../../services/itinerarioService";
import "../../styles/components/CalendarioServicos.css";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

// Toolbar customizada para admin
const CustomToolbarAdmin = ({ label, onNavigate, onView, view }) => {
  return (
    <div className="rbc-toolbar custom-toolbar" role="toolbar" aria-label="Calendário toolbar">
      <div className="nav-buttons">
        <button type="button" onClick={() => onNavigate("PREV")}>Anterior</button>
        <button type="button" onClick={() => onNavigate("TODAY")}>Hoje</button>
        <button type="button" onClick={() => onNavigate("NEXT")}>Próximo</button>
      </div>

      <span className="rbc-toolbar-label">{label}</span>

      <div className="view-buttons">
        <button type="button" onClick={() => onView("month")} className={view === "month" ? "active" : ""}>Mês</button>
        <button type="button" onClick={() => onView("agenda")} className={view === "agenda" ? "active" : ""}>Agenda</button>
      </div>
    </div>
  );
};

// Utilitário de itinerário inline para admin
const isDataPermitidaAdmin = (date, itinerario) => {
  const dayOfWeek = date.getDay();
  if (!itinerario) return true;

  if (itinerario.tipoItinerario === "FIXO") {
    // itinerario.diasSemana deve ser array de números 0..6
    return Array.isArray(itinerario.diasSemana) && itinerario.diasSemana.includes(dayOfWeek);
  }

  if (itinerario.tipoItinerario === "CICLICO") {
    // base arbitrária (pode ajustar se o seu backend usar outra base)
    const inicio = new Date(2025, 0, 1);
    const diff = Math.floor((date - inicio) / (1000 * 60 * 60 * 24));
    const ciclo = (itinerario.diasTrabalho || 0) + (itinerario.diasFolga || 0);
    if (ciclo === 0) return true;
    const posicao = ((diff % ciclo) + ciclo) % ciclo; // modulo seguro
    return posicao >= 0 && posicao < (itinerario.diasTrabalho || 0);
  }

  return true;
};

const statusInfo = {
  ACEITO: { color: "#2ecc71", icon: "✅", label: "ACE" },
  CONCLUIDO: { color: "#27ae60", icon: "🏁", label: "CON" },
  CANCELADO: { color: "#e74c3c", icon: "❌", label: "CAN" },
  RECUSADO: { color: "#c0392b", icon: "🚫", label: "REC" },
};

const CustomEvent = ({ event }) => {
  const info = statusInfo[event.status] || { color: "#7f8c8d", icon: "📄", label: "OUT" };
  return (
    <div
      style={{
        backgroundColor: info.color,
        color: "white",
        padding: "4px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.85rem",
      }}
    >
      <span>{info.icon}</span>
      <span>{event.title} [{info.label}]</span>
    </div>
  );
};

const CalendarioServicosAdmin = ({ servicos }) => {
  const [itinerario, setItinerario] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");

  useEffect(() => {
    // getItinerario normalmente retorna { data: ... }
    (async () => {
      try {
        const res = await getItinerario();
        setItinerario(res?.data ?? res); // aceita ambos formatos
      } catch (err) {
        console.error("Erro ao buscar itinerário:", err);
      }
    })();
  }, []);

  // Constrói start/end corretamente (se houver horário, concatena)
  const eventos = (servicos || []).map((s) => {
    let start;
    let end;
    if (s.data && s.horario) {
      start = new Date(`${s.data}T${s.horario}`);
      end = new Date(start.getTime() + 1000 * 60 * 60); // +1h padrão
    } else if (s.data) {
      start = new Date(s.data);
      end = new Date(s.data);
    } else {
      start = new Date();
      end = new Date();
    }
    return {
      id: s.id,
      title: s.tipoServico?.nome || s.nome || "Serviço",
      start,
      end,
      status: s.status,
      detalhes: s,
    };
  });

  const dayPropGetter = (date) => {
    // date vem como Date
    const isPast = moment(date).isBefore(moment(), "day");
    const permitido = isDataPermitidaAdmin(date, itinerario);

    if (!permitido) {
      return { style: { backgroundColor: "#fce4ec" } }; // cor para bloqueados (itinerário)
    }
    if (isPast) {
      return { style: { backgroundColor: "#f0f0f0" } }; // cor para dias já passados
    }
    return {};
  };

  return (
    <div className="calendario-admin-container">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        components={{
          toolbar: CustomToolbarAdmin, // passe a referência diretamente
          event: CustomEvent,
        }}
        dayPropGetter={dayPropGetter}
        onSelectEvent={(event) => setSelectedEvent(event.detalhes)}
        view={view}
        onView={setView}
        messages={{
          next: "Próximo",
          previous: "Anterior",
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
        }}
      />

      {/* Legenda */}
      <div className="status-legenda">
        {Object.entries(statusInfo).map(([key, info]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: "1.1rem" }}>{info.icon}</span>
            <span style={{ fontWeight: 600 }}>{info.label}</span>
            <span style={{ color: "#666", marginLeft: 6 }}>{key}</span>
          </div>
        ))}
      </div>

      {/* Modal de detalhes */}
      {selectedEvent && (
        <ModalDetalhesServico servico={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default CalendarioServicosAdmin;
