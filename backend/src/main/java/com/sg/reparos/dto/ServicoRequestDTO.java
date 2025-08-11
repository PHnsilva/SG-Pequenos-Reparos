package com.sg.reparos.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

public class ServicoRequestDTO {

    @NotBlank(message = "O problema selecionado é obrigatório.")
    private String problemaSelecionado;

    @NotBlank(message = "O nome do serviço é obrigatório.")
    private String nome;

    @NotBlank(message = "A descrição do serviço é obrigatória.")
    private String descricao;

    @NotNull(message = "O tipo de serviço deve ser informado.")
    private Long tipoServicoId;

    @NotNull(message = "O ID do cliente é obrigatório.")
    private Long clienteId;

    @NotBlank(message = "O telefone de contato é obrigatório.")
    private String telefoneContato;

    @NotNull(message = "A data específica é obrigatória.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate diaEspecifico;

    private List<LocalDate> outrosDias; 

    @NotNull(message = "O horário desejado é obrigatório.")
    private LocalTime horario;

    // Campos opcionais para edição
    private LocalDate data;
    private String status;

    // Getters e Setters
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

    public Long getTipoServicoId() {
        return tipoServicoId;
    }

    public void setTipoServicoId(Long tipoServicoId) {
        this.tipoServicoId = tipoServicoId;
    }

    public List<LocalDate> getOutrosDias() {
        return outrosDias;
    }

    public void setOutrosDias(List<LocalDate> outrosDias) {
        this.outrosDias = outrosDias;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
     public LocalDate getDiaEspecifico() {
        return diaEspecifico;
    }

    public void setDiaEspecifico(LocalDate diaEspecifico) {
        this.diaEspecifico = diaEspecifico;
    }

    public String getTelefoneContato() {
        return telefoneContato;
    }

    public void setTelefoneContato(String telefoneContato) {
        this.telefoneContato = telefoneContato;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public String getProblemaSelecionado() {
        return problemaSelecionado;
    }
    public void setProblemaSelecionado(String problemaSelecionado) {
        this.problemaSelecionado = problemaSelecionado;
    }
}
