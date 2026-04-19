package com.medsched.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String empid;

    @Column(nullable = false, length = 100)
    private String empname;

    @Column(precision = 12, scale = 2)
    private BigDecimal empsalary;

    @Column(name = "emp_role", nullable = false, length = 50)
    private String empRole;

    @Column(nullable = false, length = 50)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_type")
    private ShiftTypeEnum shiftType = ShiftTypeEnum.MORNING;

    @Column(name = "work_hours")
    private Integer workHours = 8;

    @Column(length = 150)
    private String qualification;

    @Column(length = 20)
    private String phone;

    @Column(length = 100, unique = true)
    private String email;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    private StatusEnum status = StatusEnum.Active;


    public enum ShiftTypeEnum { MORNING, EVENING, NIGHT }
    public enum StatusEnum { Active, Inactive }

    // ── GETTERS & SETTERS ──────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmpid() { return empid; }
    public void setEmpid(String empid) { this.empid = empid; }

    public String getEmpname() { return empname; }
    public void setEmpname(String empname) { this.empname = empname; }

    public BigDecimal getEmpsalary() { return empsalary; }
    public void setEmpsalary(BigDecimal empsalary) { this.empsalary = empsalary; }

    public String getEmpRole() { return empRole; }
    public void setEmpRole(String empRole) { this.empRole = empRole; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public ShiftTypeEnum getShiftType() { return shiftType; }
    public void setShiftType(ShiftTypeEnum shiftType) { this.shiftType = shiftType; }

    public Integer getWorkHours() { return workHours; }
    public void setWorkHours(Integer workHours) { this.workHours = workHours; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public StatusEnum getStatus() { return status; }
    public void setStatus(StatusEnum status) { this.status = status; }

}
