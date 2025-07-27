package com.sg.reparos.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.sg.reparos.model.Servico;

public class ServicoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private String tipoServico;
    private Long clienteId;
    private String clienteNome;
    private String emailContato;
    private String telefoneContato;
    private LocalDate diaEspecifico;
    private List<LocalDate> outrosDias;
    private String status;
    private String administradorNome;
    private LocalDate data;
    private LocalTime horario;

    // Construtor padrão
    public ServicoResponseDTO() {
    }

    public ServicoResponseDTO(Servico servico) {
        this.id = servico.getId();
        this.nome = servico.getNome();
        this.descricao = servico.getDescricao();
        this.tipoServico = servico.getTipoServico().getNome();
        this.clienteId = servico.getCliente().getId();
        this.clienteNome = servico.getCliente().getNome();
        this.emailContato = servico.getEmailContato();
        this.telefoneContato = servico.getTelefoneContato();
        this.diaEspecifico = servico.getDiaEspecifico();
        this.outrosDias = servico.getOutrosDiasDisponiveis();
        this.status = servico.getStatus().name();
        this.administradorNome = servico.getAdministrador() != null ? servico.getAdministrador().getNome() : null;
        this.horario = servico.getHorario();
    }

    // Getters e Setters

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

    public String getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(String tipoServico) {
        this.tipoServico = tipoServico;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getEmailContato() {
        return emailContato;
    }

    public void setEmailContato(String emailContato) {
        this.emailContato = emailContato;
    }

    public String getTelefoneContato() {
        return telefoneContato;
    }

    public void setTelefoneContato(String telefoneContato) {
        this.telefoneContato = telefoneContato;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdministradorNome() {
        return administradorNome;
    }

    public void setAdministradorNome(String administradorNome) {
        this.administradorNome = administradorNome;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public LocalDate getDiaEspecifico() {
        return diaEspecifico;
    }

    public void setDiaEspecifico(LocalDate diaEspecifico) {
        this.diaEspecifico = diaEspecifico;
    }

    public List<LocalDate> getOutrosDias() {
        return outrosDias;
    }

    public void setOutrosDias(List<LocalDate> outrosDias) {
        this.outrosDias = outrosDias;
    }

}
