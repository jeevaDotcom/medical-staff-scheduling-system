package com.medsched.repository;

import com.medsched.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByAttDate(LocalDate date);

    Optional<Attendance> findByStaffIdAndAttDate(Long staffId, LocalDate date);

    List<Attendance> findByStaffId(Long staffId);

    @Query("SELECT a FROM Attendance a WHERE a.attDate = :date ORDER BY a.staff.empname")
    List<Attendance> findTodayAttendance(@Param("date") LocalDate date);
}
