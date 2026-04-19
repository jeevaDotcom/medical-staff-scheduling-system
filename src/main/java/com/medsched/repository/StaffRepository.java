package com.medsched.repository;

import com.medsched.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    List<Staff> findByStatus(Staff.StatusEnum status);

    List<Staff> findByDepartmentIgnoreCase(String department);


    @Query("SELECT s FROM Staff s WHERE " +
           "(:name IS NULL OR LOWER(s.empname) LIKE LOWER(CONCAT('%',:name,'%')) OR LOWER(s.empid) LIKE LOWER(CONCAT('%',:name,'%'))) AND " +
           "(:dept IS NULL OR s.department = :dept) AND " +
           "(:role IS NULL OR s.empRole = :role)")
    List<Staff> searchStaff(@Param("name") String name,
                             @Param("dept") String dept,
                             @Param("role") String role);
}
