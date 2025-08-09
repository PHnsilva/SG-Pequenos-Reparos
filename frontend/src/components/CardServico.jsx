const CardServico = ({ servico, tipo, isAdmin = false }) => {
  const formatarData = (isoDate) => {
    const [ano, mes, dia] = isoDate.split("-");
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  };

  const zapLink = "https://wa.me/5598987654321"; // número correto do Gelson

  return (
    <div className="card-servico">
      <h4>{servico.nome}</h4>
      <p>Status: {servico.status}</p>

      {servico.diaEspecifico && (
        <p>Data agendada: {formatarData(servico.diaEspecifico)}</p>
      )}

      {tipo === "agendado" && servico.horario && (
        <p>
          <strong>Agendado para:</strong>{" "}
          {formatarData(servico.diaEspecifico)} às {servico.horario}
        </p>
      )}

      {!isAdmin && servico.status === "SOLICITADO" && (
        <a
          href={zapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-zap-card"
        >
          Falar com Prestador no WhatsApp
        </a>
      )}
    </div>
  );
};

export default CardServico;
