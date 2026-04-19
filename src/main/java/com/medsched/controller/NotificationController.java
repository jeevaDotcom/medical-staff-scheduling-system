package com.medsched.controller;

import com.medsched.model.Notification;
import com.medsched.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired private NotificationRepository notifRepo;

    // GET /api/notifications
    @GetMapping
    public List<Map<String, Object>> getAll() {
        return notifRepo.findAllByOrderByCreatedAtDesc().stream().map(this::flatten).toList();
    }

    // GET /api/notifications/unread
    @GetMapping("/unread")
    public List<Map<String, Object>> getUnread() {
        return notifRepo.findByIsReadFalseOrderByCreatedAtDesc().stream().map(this::flatten).toList();
    }

    // GET /api/notifications/count
    @GetMapping("/count")
    public Map<String, Long> getUnreadCount() {
        return Map.of("unread", notifRepo.countByIsReadFalse());
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markRead(@PathVariable Long id) {
        return notifRepo.findById(id).map(n -> {
            n.setIsRead(true);
            return ResponseEntity.ok(flatten(notifRepo.save(n)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/notifications/read-all
    @PutMapping("/read-all")
    public Map<String, String> markAllRead() {
        List<Notification> unread = notifRepo.findByIsReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setIsRead(true));
        notifRepo.saveAll(unread);
        return Map.of("message", "All notifications marked as read");
    }

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        Notification n = new Notification();
        n.setMessage(body.get("message"));
        if (body.get("type") != null) n.setType(Notification.NotifType.valueOf(body.get("type")));
        return ResponseEntity.ok(flatten(notifRepo.save(n)));
    }

    private Map<String, Object> flatten(Notification n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("message", n.getMessage());
        m.put("type", n.getType());
        m.put("isRead", n.getIsRead());
        m.put("staffId", n.getStaff() != null ? n.getStaff().getId() : null);
        m.put("staffName", n.getStaff() != null ? n.getStaff().getEmpname() : null);
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}
