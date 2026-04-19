package com.medsched.controller;

import com.medsched.model.Staff;
import com.medsched.repository.StaffRepository;
import com.medsched.repository.NotificationRepository;
import com.medsched.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private StaffRepository staffRepo;

    @Autowired
    private NotificationRepository notifRepo;

    // GET /api/staff?name=&dept=&role=
    @GetMapping
    public List<Staff> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String dept,
            @RequestParam(required = false) String role) {
        if ((name == null || name.isBlank()) && (dept == null || dept.isBlank()) && (role == null || role.isBlank())) {
            return staffRepo.findAll();
        }
        return staffRepo.searchStaff(
                (name == null || name.isBlank()) ? null : name,
                (dept == null || dept.isBlank()) ? null : dept,
                (role == null || role.isBlank()) ? null : role
        );
    }

    // GET /api/staff/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getById(@PathVariable Long id) {
        return staffRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/staff
    @PostMapping
    public ResponseEntity<Staff> create(@RequestBody Staff staff) {
        Staff saved = staffRepo.save(staff);
        // Create notification
        Notification n = new Notification();
        n.setMessage("New staff member added: " + saved.getEmpname() + " (" + saved.getDepartment() + ")");
        n.setType(Notification.NotifType.SUCCESS);
        n.setStaff(saved);
        notifRepo.save(n);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/staff/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Staff> update(@PathVariable Long id, @RequestBody Staff updated) {
        return staffRepo.findById(id).map(s -> {
            s.setEmpname(updated.getEmpname());
            s.setEmpsalary(updated.getEmpsalary());
            s.setEmpRole(updated.getEmpRole());
            s.setDepartment(updated.getDepartment());
            s.setShiftType(updated.getShiftType());
            s.setWorkHours(updated.getWorkHours());
            s.setQualification(updated.getQualification());
            s.setPhone(updated.getPhone());
            s.setEmail(updated.getEmail());
            s.setJoiningDate(updated.getJoiningDate());
            s.setStatus(updated.getStatus());
            return ResponseEntity.ok(staffRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/staff/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        if (!staffRepo.existsById(id)) return ResponseEntity.notFound().build();
        staffRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Staff deleted successfully"));
    }

    // GET /api/staff/departments — distinct departments
    @GetMapping("/departments")
    public List<String> getDepartments() {
        return staffRepo.findAll().stream()
                .map(Staff::getDepartment).distinct().sorted().toList();
    }

    // GET /api/staff/roles — distinct roles
    @GetMapping("/roles")
    public List<String> getRoles() {
        return staffRepo.findAll().stream()
                .map(Staff::getEmpRole).distinct().sorted().toList();
    }
}
