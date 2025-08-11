package com.sg.reparos.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "servicos")
public class Servico {

    @ManyToOne
    @JoinColumn(name = "id_problema")
    private Problema problema;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String problemaSelecionado;


    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne
    @JoinColumn(name = "administrador_id")
    private Usuario administrador; // Só preenchido quando aceito

    @Column(nullable = false)
    private String telefoneContato;
    @Column(nullable = false)
    private LocalDate diaEspecifico;

    @ElementCollection
    @CollectionTable(name = "servico_outros_dias", joinColumns = @JoinColumn(name = "servico_id"))
    @Column(name = "data")
    private List<LocalDate> outrosDiasDisponiveis;

    private LocalTime horario; // Horário agendado (preenchido pelo admin)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusServico status;

    private String motivoCancelamento; // Motivo preenchido quando cancelado

    // Enum para o status do serviço
    public enum StatusServico {
        SOLICITADO,
        ACEITO,
        RECUSADO,
        CANCELADO,
        CONCLUIDO
    }

    @OneToOne(mappedBy = "servico", cascade = CascadeType.ALL)
    private Avaliacao avaliacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoServico getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(TipoServico tipoServico) {
        this.tipoServico = tipoServico;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public Usuario getAdministrador() {
        return administrador;
    }

    public void setAdministrador(Usuario administrador) {
        this.administrador = administrador;
    }

    public String getTelefoneContato() {
        return telefoneContato;
    }

    public void setTelefoneContato(String telefoneContato) {
        this.telefoneContato = telefoneContato;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public StatusServico getStatus() {
        return status;
    }

    public void setStatus(StatusServico status) {
        this.status = status;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public LocalDate getDiaEspecifico() {
        return diaEspecifico;
    }

    public void setDiaEspecifico(LocalDate diaEspecifico) {
        this.diaEspecifico = diaEspecifico;
    }

    public List<LocalDate> getOutrosDiasDisponiveis() {
        return outrosDiasDisponiveis;
    }

    public void setOutrosDiasDisponiveis(List<LocalDate> outrosDiasDisponiveis) {
        this.outrosDiasDisponiveis = outrosDiasDisponiveis;
    }
    public Problema getProblema() {
        return problema;
    }
    public void setProblema(Problema problema) {
        this.problema = problema;
    }
    public String getProblemaSelecionado() {
        return problemaSelecionado;
    }
    public void setProblemaSelecionado(String problemaSelecionado) {
        this.problemaSelecionado = problemaSelecionado;
    }

}
