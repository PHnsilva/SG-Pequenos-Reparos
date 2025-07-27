package com.sg.reparos.service;

import com.sg.reparos.dto.NotificacaoRequestDTO;
import com.sg.reparos.dto.ServicoRequestDTO;
import com.sg.reparos.dto.ServicoResponseDTO;
import com.sg.reparos.model.Notificacao;
import com.sg.reparos.model.Problema;
import com.sg.reparos.model.Servico;
import com.sg.reparos.model.Servico.StatusServico;
import com.sg.reparos.model.TipoServico;
import com.sg.reparos.model.Usuario;
import com.sg.reparos.repository.ServicoRepository;
import com.sg.reparos.repository.TipoServicoRepository;
import com.sg.reparos.repository.UsuarioRepository;
import com.sg.reparos.repository.NotificacaoRepository;
import com.sg.reparos.repository.ProblemaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoServicoRepository tipoServicoRepository;
    private final NotificacaoService notificacaoService;
    private final NotificacaoRepository notificacaoRepository;
    private final ProblemaRepository problemaRepository;

    public ServicoService(ServicoRepository servicoRepository,
                          UsuarioRepository usuarioRepository,
                          TipoServicoRepository tipoServicoRepository,
                          NotificacaoService notificacaoService,
                          NotificacaoRepository notificacaoRepository,
                          ProblemaRepository problemaRepository) {
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoServicoRepository = tipoServicoRepository;
        this.notificacaoService = notificacaoService;
        this.notificacaoRepository = notificacaoRepository;
        this.problemaRepository = problemaRepository;
    }

    public ServicoResponseDTO solicitarServico(ServicoRequestDTO dto) {
        Servico servico = new Servico();
        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setEmailContato(dto.getEmailContato());
        servico.setTelefoneContato(dto.getTelefoneContato());
        servico.setStatus(StatusServico.SOLICITADO);

        // disponibilidade do cliente
        servico.setDiaEspecifico(dto.getDiaEspecifico());
        servico.setOutrosDiasDisponiveis(dto.getOutrosDias());

        // problema selecionado
        servico.setProblemaSelecionado(dto.getProblemaSelecionado());
        Problema problema = problemaRepository.findByNome(dto.getProblemaSelecionado())
                .orElseThrow(() -> new RuntimeException("Problema não encontrado"));
        servico.setProblema(problema);

        Usuario cliente = usuarioRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        servico.setCliente(cliente);

        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new RuntimeException("Tipo de serviço não encontrado"));
        servico.setTipoServico(tipoServico);

        Servico salvo = servicoRepository.save(servico);

        // notificação ao cliente
        NotificacaoRequestDTO notiCliente = new NotificacaoRequestDTO();
        notiCliente.setTitulo("Solicitação enviada com sucesso");
        notiCliente.setMensagem("Você solicitou o serviço: " + salvo.getNome());
        notiCliente.setClienteId(salvo.getCliente().getId());
        notiCliente.setTipo(Notificacao.TipoNotificacao.SOLICITACAO);
        notificacaoService.enviar(notiCliente);

        return toResponseDTO(salvo);
    }

    public ServicoResponseDTO aceitarServico(Long id, Long administradorId, String data, String horario) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        Usuario administrador = usuarioRepository.findById(administradorId)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));

        LocalDate dataAgendada = LocalDate.parse(data);
        LocalTime horarioAgendado = LocalTime.parse(horario);

        // verifica disponibilidade
        if (!dataAgendada.equals(servico.getDiaEspecifico()) &&
            (servico.getOutrosDiasDisponiveis() == null || !servico.getOutrosDiasDisponiveis().contains(dataAgendada))) {
            throw new RuntimeException("Data selecionada não está disponível para o cliente.");
        }
        // verifica horário no passado
        LocalDateTime agendamento = LocalDateTime.of(dataAgendada, horarioAgendado);
        if (agendamento.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("O horário selecionado já passou.");
        }
        // verifica se horário já ocupado
        if (servicoRepository.existsByDiaEspecificoAndHorarioAndStatus(dataAgendada, horarioAgendado, StatusServico.ACEITO)) {
            throw new RuntimeException("O horário selecionado já está ocupado.");
        }

        servico.setStatus(StatusServico.ACEITO);
        servico.setAdministrador(administrador);
        servico.setDiaEspecifico(dataAgendada);
        servico.setHorario(horarioAgendado);
        servico.setOutrosDiasDisponiveis(null);

        Servico atualizado = servicoRepository.save(servico);

        // notificações
        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço aceito e agendado",
                "Seu serviço '" + atualizado.getNome() + "' foi aceito e agendado para "
                        + atualizado.getDiaEspecifico() + " às " + atualizado.getHorario(),
                atualizado.getCliente().getId(), null, Notificacao.TipoNotificacao.AGENDAMENTO));

        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço agendado com sucesso",
                "Você agendou o serviço '" + atualizado.getNome() + "' para "
                        + atualizado.getDiaEspecifico() + " às " + atualizado.getHorario(),
                null, administrador.getId(), Notificacao.TipoNotificacao.AGENDAMENTO));

        return toResponseDTO(atualizado);
    }

    public ServicoResponseDTO recusarServico(Long id) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        servico.setStatus(StatusServico.RECUSADO);
        Servico atualizado = servicoRepository.save(servico);

        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço recusado",
                "Seu serviço '" + atualizado.getNome() + "' foi recusado.",
                atualizado.getCliente().getId(), null, Notificacao.TipoNotificacao.RECUSA));

        return toResponseDTO(atualizado);
    }

    public ServicoResponseDTO cancelarServico(Long id, String motivo) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        servico.setStatus(StatusServico.CANCELADO);
        servico.setMotivoCancelamento(motivo);
        Servico atualizado = servicoRepository.save(servico);

        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço cancelado",
                "O serviço '" + atualizado.getNome() + "' foi cancelado. Motivo: " + motivo,
                atualizado.getCliente().getId(),
                atualizado.getAdministrador() != null ? atualizado.getAdministrador().getId() : null,
                Notificacao.TipoNotificacao.CANCELAMENTO));

        return toResponseDTO(atualizado);
    }

    public ServicoResponseDTO concluirServico(Long id) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        servico.setStatus(StatusServico.CONCLUIDO);
        Servico atualizado = servicoRepository.save(servico);

        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço concluído",
                "O serviço '" + atualizado.getNome() + "' foi concluído.",
                atualizado.getCliente().getId(),
                atualizado.getAdministrador() != null ? atualizado.getAdministrador().getId() : null,
                Notificacao.TipoNotificacao.CONCLUSAO));

        return toResponseDTO(atualizado);
    }

    public ServicoResponseDTO editarServico(Long id, ServicoRequestDTO dto) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setEmailContato(dto.getEmailContato());
        servico.setTelefoneContato(dto.getTelefoneContato());

        TipoServico tipo = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new RuntimeException("Tipo de serviço não encontrado"));
        servico.setTipoServico(tipo);

        servico.setDiaEspecifico(dto.getDiaEspecifico());
        servico.setOutrosDiasDisponiveis(dto.getOutrosDias());

        if (dto.getStatus() != null) {
            servico.setStatus(StatusServico.valueOf(dto.getStatus().toUpperCase()));
        }

        Servico atualizado = servicoRepository.save(servico);

        notificacaoService.enviar(new NotificacaoRequestDTO(
                "Serviço editado",
                "O serviço '" + atualizado.getNome() + "' foi editado.",
                atualizado.getCliente().getId(),
                atualizado.getAdministrador() != null ? atualizado.getAdministrador().getId() : null,
                Notificacao.TipoNotificacao.EDICAO));

        return toResponseDTO(atualizado);
    }

    @Scheduled(fixedRate = 60000)
    public void notificarServicosAgendadosProximos() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusHours(24);
        List<Servico> agendados = servicoRepository.findByStatus(StatusServico.ACEITO).stream()
                .filter(s -> s.getDiaEspecifico() != null && s.getHorario() != null)
                .filter(s -> {
                    LocalDateTime agendamento = LocalDateTime.of(s.getDiaEspecifico(), s.getHorario());
                    return agendamento.isAfter(agora) && !agendamento.isAfter(limite);
                })
                .collect(Collectors.toList());

        agendados.forEach(s -> {
            String msg = "O serviço '" + s.getNome() + "' está agendado para "
                          + s.getDiaEspecifico() + " às " + s.getHorario();
            String tituloCliente = "Lembrete: serviço #" + s.getId();
            boolean jaEnviadoCliente = notificacaoRepository
                    .existsByTipoAndClienteAndTitulo(Notificacao.TipoNotificacao.LEMBRETE,
                            s.getCliente(), tituloCliente);
            if (!jaEnviadoCliente) {
                notificacaoService.enviar(new NotificacaoRequestDTO(
                        tituloCliente, msg, s.getCliente().getId(), null,
                        Notificacao.TipoNotificacao.LEMBRETE));
            }
            if (s.getAdministrador() != null) {
                String tituloAdmin = tituloCliente + " (admin)";
                boolean jaEnviadoAdmin = notificacaoRepository
                        .existsByTipoAndAdminAndTitulo(Notificacao.TipoNotificacao.LEMBRETE,
                                s.getAdministrador(), tituloAdmin);
                if (!jaEnviadoAdmin) {
                    notificacaoService.enviar(new NotificacaoRequestDTO(
                            tituloAdmin, msg, null, s.getAdministrador().getId(),
                            Notificacao.TipoNotificacao.LEMBRETE));
                }
            }
        });
    }

    /**
     * Retorna lista de horários ocupados para uma data, excluindo horários passados se for hoje.
     */
    public List<String> buscarHorariosOcupados(String dataStr) {
        LocalDate data = LocalDate.parse(dataStr);
        LocalTime agora = LocalTime.now();

        return servicoRepository.findByDiaEspecificoAndStatus(data, StatusServico.ACEITO).stream()
                .map(Servico::getHorario)
                .filter(h -> !data.equals(LocalDate.now()) || h.isAfter(agora))
                .map(h -> h.toString().substring(0, 5))
                .collect(Collectors.toList());
    }

    /**
     * Verifica se um horário específico está indisponível (ocupado ou já passou).
     */
    public boolean isHorarioIndisponivel(String dataStr, String horarioStr) {
        LocalDate data = LocalDate.parse(dataStr);
        LocalTime horario = LocalTime.parse(horarioStr);
        LocalDateTime agendamento = LocalDateTime.of(data, horario);

        // passou da hora atual?
        if (agendamento.isBefore(LocalDateTime.now())) {
            return true;
        }
        // já existe agendamento confirmado?
        return servicoRepository.existsByDiaEspecificoAndHorarioAndStatus(data, horario, StatusServico.ACEITO);
    }

    public List<ServicoResponseDTO> listarTodos() {
        return servicoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ServicoResponseDTO buscarPorId(Long id) {
        return servicoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
    }

    private ServicoResponseDTO toResponseDTO(Servico servico) {
        ServicoResponseDTO dto = new ServicoResponseDTO();
        dto.setId(servico.getId());
        dto.setNome(servico.getNome());
        dto.setDescricao(servico.getDescricao());
        dto.setTipoServico(servico.getTipoServico().getNome());
        dto.setClienteId(servico.getCliente().getId());
        dto.setClienteNome(servico.getCliente().getNome());
        dto.setEmailContato(servico.getEmailContato());
        dto.setTelefoneContato(servico.getTelefoneContato());
        dto.setStatus(servico.getStatus().name());
        if (servico.getAdministrador() != null) {
            dto.setAdministradorNome(servico.getAdministrador().getNome());
        }
        dto.setDiaEspecifico(servico.getDiaEspecifico());
        dto.setOutrosDias(servico.getOutrosDiasDisponiveis());
        dto.setHorario(servico.getHorario());
        return dto;
    }
}
