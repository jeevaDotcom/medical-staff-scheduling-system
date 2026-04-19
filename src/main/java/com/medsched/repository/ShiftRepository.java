package com.medsched.repository;

import com.medsched.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByShiftDate(LocalDate date);
    List<Shift> findByStaffId(Long staffId);
    List<Shift> findByShiftDateBetween(LocalDate start, LocalDate end);
}
