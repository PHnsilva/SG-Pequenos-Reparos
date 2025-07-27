const CardServico = ({ servico, tipo }) => {
  const formatarData = (isoDate) => {
    const [ano, mes, dia] = isoDate.split("-");
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  };

  return (
    <div className="card-servico">
      <h4>{servico.nome}</h4>
      <p>Status: {servico.status}</p>

      {/* usa diaEspecifico em vez de data */}
      {servico.diaEspecifico && (
        <p>Data agendada: {formatarData(servico.diaEspecifico)}</p>
      )}

      {tipo === "agendado" && servico.diaEspecifico && servico.horario && (
        <p>
          <strong>Agendado para:</strong>{" "}
          {formatarData(servico.diaEspecifico)} às {servico.horario}
        </p>
      )}
    </div>
  );
};

export default CardServico;
