package com.medsched.controller;

import com.medsched.model.LeaveRequest;
import com.medsched.model.Notification;
import com.medsched.model.Staff;
import com.medsched.repository.LeaveRepository;
import com.medsched.repository.NotificationRepository;
import com.medsched.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired private LeaveRepository leaveRepo;
    @Autowired private StaffRepository staffRepo;
    @Autowired private NotificationRepository notifRepo;

    // GET /api/leave
    @GetMapping
    public List<Map<String, Object>> getAll(@RequestParam(required = false) String status) {
        List<LeaveRequest> list = (status != null && !status.isBlank())
                ? leaveRepo.findByStatus(LeaveRequest.LeaveStatus.valueOf(status))
                : leaveRepo.findAll();
        return list.stream().map(this::flatten).toList();
    }

    // GET /api/leave/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return leaveRepo.findById(id)
                .map(l -> ResponseEntity.ok(flatten(l)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/leave
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        Long staffId = Long.parseLong(body.get("staffId").toString());
        Staff staff = staffRepo.findById(staffId).orElseThrow();
        LeaveRequest lr = new LeaveRequest();
        lr.setStaff(staff);
        lr.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        lr.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        if (body.get("reason") != null) lr.setReason(body.get("reason").toString());
        LeaveRequest saved = leaveRepo.save(lr);

        Notification n = new Notification();
        n.setMessage("Leave request submitted by " + staff.getEmpname() + " (" + saved.getStartDate() + " to " + saved.getEndDate() + ")");
        n.setType(Notification.NotifType.INFO);
        n.setStaff(staff);
        notifRepo.save(n);

        return ResponseEntity.ok(flatten(saved));
    }

    // PUT /api/leave/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable Long id) {
        return leaveRepo.findById(id).map(lr -> {
            lr.setStatus(LeaveRequest.LeaveStatus.APPROVED);
            LeaveRequest saved = leaveRepo.save(lr);
            Notification n = new Notification();
            n.setMessage("Leave approved for " + saved.getStaff().getEmpname());
            n.setType(Notification.NotifType.SUCCESS);
            n.setStaff(saved.getStaff());
            notifRepo.save(n);
            return ResponseEntity.ok(flatten(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/leave/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable Long id) {
        return leaveRepo.findById(id).map(lr -> {
            lr.setStatus(LeaveRequest.LeaveStatus.REJECTED);
            LeaveRequest saved = leaveRepo.save(lr);
            Notification n = new Notification();
            n.setMessage("Leave rejected for " + saved.getStaff().getEmpname());
            n.setType(Notification.NotifType.DANGER);
            n.setStaff(saved.getStaff());
            notifRepo.save(n);
            return ResponseEntity.ok(flatten(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> flatten(LeaveRequest lr) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", lr.getId());
        m.put("staffId", lr.getStaff().getId());
        m.put("staffName", lr.getStaff().getEmpname());
        m.put("empid", lr.getStaff().getEmpid());
        m.put("department", lr.getStaff().getDepartment());
        m.put("startDate", lr.getStartDate());
        m.put("endDate", lr.getEndDate());
        m.put("reason", lr.getReason());
        m.put("status", lr.getStatus());
        m.put("createdAt", lr.getCreatedAt());
        return m;
    }
}
