package com.sg.reparos.repository;

import com.sg.reparos.model.Servico;
import com.sg.reparos.model.Servico.StatusServico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByClienteId(Long clienteId);

    List<Servico> findByAdministradorId(Long administradorId);

    List<Servico> findByStatus(StatusServico status);

    // Para agendamentos futuros (já ocupados)
    List<Servico> findByDiaEspecificoAndStatus(LocalDate diaEspecifico, StatusServico status);

    // Usado no isHorarioIndisponivel e em aceitarServico
    boolean existsByDiaEspecificoAndHorarioAndStatus(LocalDate diaEspecifico,
                                                    LocalTime horario,
                                                    StatusServico status);
}
