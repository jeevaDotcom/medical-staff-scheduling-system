package com.medsched.controller;

import com.medsched.model.Attendance;
import com.medsched.model.Notification;
import com.medsched.model.Staff;
import com.medsched.repository.AttendanceRepository;
import com.medsched.repository.NotificationRepository;
import com.medsched.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private StaffRepository staffRepo;
    @Autowired private NotificationRepository notifRepo;

    // GET /api/attendance/today
    @GetMapping("/today")
    public List<Map<String, Object>> getToday() {
        return mapAttendances(attendanceRepo.findTodayAttendance(LocalDate.now()));
    }

    // GET /api/attendance/date/{date}
    @GetMapping("/date/{date}")
    public List<Map<String, Object>> getByDate(@PathVariable String date) {
        LocalDate d = LocalDate.parse(date);
        return mapAttendances(attendanceRepo.findByAttDate(d));
    }

    // GET /api/attendance/staff/{staffId}
    @GetMapping("/staff/{staffId}")
    public List<Attendance> getByStaff(@PathVariable Long staffId) {
        return attendanceRepo.findByStaffId(staffId);
    }

    // POST /api/attendance/checkin/{staffId}
    @PostMapping("/checkin/{staffId}")
    public ResponseEntity<Map<String, Object>> checkIn(@PathVariable Long staffId) {
        Staff staff = staffRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepo.findByStaffIdAndAttDate(staffId, today);

        Attendance att;
        if (existing.isPresent()) {
            att = existing.get();
            if (att.getCheckIn() != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already checked in today"));
            }
        } else {
            att = new Attendance();
            att.setStaff(staff);
            att.setAttDate(today);
        }

        LocalDateTime now = LocalDateTime.now();
        att.setCheckIn(now);
        // Mark LATE if after 7:30 AM
        att.setStatus(now.getHour() > 7 || (now.getHour() == 7 && now.getMinute() > 30)
                ? Attendance.AttendanceStatus.LATE
                : Attendance.AttendanceStatus.PRESENT);
        attendanceRepo.save(att);

        // Notify if late
        if (att.getStatus() == Attendance.AttendanceStatus.LATE) {
            Notification n = new Notification();
            n.setMessage(staff.getEmpname() + " checked in late at " + now.toLocalTime().toString().substring(0,5));
            n.setType(Notification.NotifType.WARNING);
            n.setStaff(staff);
            notifRepo.save(n);
        }

        return ResponseEntity.ok(Map.of(
            "message", "Check-in recorded",
            "checkIn", now.toString(),
            "status", att.getStatus().name()
        ));
    }

    // POST /api/attendance/checkout/{staffId}
    @PostMapping("/checkout/{staffId}")
    public ResponseEntity<Map<String, Object>> checkOut(@PathVariable Long staffId) {
        LocalDate today = LocalDate.now();
        Attendance att = attendanceRepo.findByStaffIdAndAttDate(staffId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        if (att.getCheckIn() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Staff has not checked in yet"));
        }
        if (att.getCheckOut() != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already checked out today"));
        }

        LocalDateTime now = LocalDateTime.now();
        att.setCheckOut(now);
        attendanceRepo.save(att);

        return ResponseEntity.ok(Map.of(
            "message", "Check-out recorded",
            "checkOut", now.toString()
        ));
    }

    // POST /api/attendance — manual record
    @PostMapping
    public ResponseEntity<Attendance> create(@RequestBody Map<String, Object> body) {
        Long staffId = Long.parseLong(body.get("staffId").toString());
        Staff staff = staffRepo.findById(staffId).orElseThrow();
        Attendance att = new Attendance();
        att.setStaff(staff);
        att.setAttDate(LocalDate.parse(body.get("date").toString()));
        att.setStatus(Attendance.AttendanceStatus.valueOf(body.get("status").toString()));
        if (body.get("notes") != null) att.setNotes(body.get("notes").toString());
        return ResponseEntity.ok(attendanceRepo.save(att));
    }

    // Helper: flatten attendance with staff name
    private List<Map<String, Object>> mapAttendances(List<Attendance> list) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("staffId", a.getStaff().getId());
            m.put("staffName", a.getStaff().getEmpname());
            m.put("empid", a.getStaff().getEmpid());
            m.put("department", a.getStaff().getDepartment());
            m.put("role", a.getStaff().getEmpRole());
            m.put("date", a.getAttDate());
            m.put("checkIn", a.getCheckIn());
            m.put("checkOut", a.getCheckOut());
            m.put("status", a.getStatus());
            m.put("notes", a.getNotes());
            result.add(m);
        }
        return result;
    }
}
