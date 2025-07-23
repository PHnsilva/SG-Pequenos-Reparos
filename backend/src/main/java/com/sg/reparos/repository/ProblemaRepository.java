package com.sg.reparos.repository;

import com.sg.reparos.model.Problema;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProblemaRepository extends JpaRepository<Problema, Long> {

    Optional<Problema> findByNome(String nome);
}
