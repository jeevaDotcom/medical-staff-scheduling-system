package com.medsched.controller;

import com.medsched.model.Shift;
import com.medsched.model.Staff;
import com.medsched.repository.ShiftRepository;
import com.medsched.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    @Autowired private ShiftRepository shiftRepo;
    @Autowired private StaffRepository staffRepo;

    // GET /api/shifts/today
    @GetMapping("/today")
    public List<Map<String, Object>> getToday() {
        return flattenShifts(shiftRepo.findByShiftDate(LocalDate.now()));
    }

    // GET /api/shifts/date/{date}
    @GetMapping("/date/{date}")
    public List<Map<String, Object>> getByDate(@PathVariable String date) {
        return flattenShifts(shiftRepo.findByShiftDate(LocalDate.parse(date)));
    }

    // GET /api/shifts/staff/{staffId}
    @GetMapping("/staff/{staffId}")
    public List<Map<String, Object>> getByStaff(@PathVariable Long staffId) {
        return flattenShifts(shiftRepo.findByStaffId(staffId));
    }

    // POST /api/shifts
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        Long staffId = Long.parseLong(body.get("staffId").toString());
        Staff staff = staffRepo.findById(staffId).orElseThrow(() -> new RuntimeException("Staff not found"));
        Shift shift = new Shift();
        shift.setStaff(staff);
        shift.setShiftType(Shift.ShiftType.valueOf(body.get("shiftType").toString()));
        shift.setShiftDate(LocalDate.parse(body.get("shiftDate").toString()));
        shift.setStartTime(LocalTime.parse(body.get("startTime").toString()));
        shift.setEndTime(LocalTime.parse(body.get("endTime").toString()));
        if (body.get("room") != null) shift.setRoom(body.get("room").toString());
        if (body.get("notes") != null) shift.setNotes(body.get("notes").toString());
        Shift saved = shiftRepo.save(shift);
        return ResponseEntity.ok(flattenShift(saved));
    }

    // PUT /api/shifts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return shiftRepo.findById(id).map(s -> {
            if (body.get("shiftType") != null) s.setShiftType(Shift.ShiftType.valueOf(body.get("shiftType").toString()));
            if (body.get("shiftDate") != null) s.setShiftDate(LocalDate.parse(body.get("shiftDate").toString()));
            if (body.get("startTime") != null) s.setStartTime(LocalTime.parse(body.get("startTime").toString()));
            if (body.get("endTime") != null) s.setEndTime(LocalTime.parse(body.get("endTime").toString()));
            if (body.get("room") != null) s.setRoom(body.get("room").toString());
            if (body.get("notes") != null) s.setNotes(body.get("notes").toString());
            return ResponseEntity.ok(flattenShift(shiftRepo.save(s)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/shifts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        if (!shiftRepo.existsById(id)) return ResponseEntity.notFound().build();
        shiftRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Shift deleted"));
    }

    private List<Map<String, Object>> flattenShifts(List<Shift> shifts) {
        return shifts.stream().map(this::flattenShift).toList();
    }

    private Map<String, Object> flattenShift(Shift s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("staffId", s.getStaff().getId());
        m.put("staffName", s.getStaff().getEmpname());
        m.put("empid", s.getStaff().getEmpid());
        m.put("department", s.getStaff().getDepartment());
        m.put("shiftType", s.getShiftType());
        m.put("shiftDate", s.getShiftDate());
        m.put("startTime", s.getStartTime());
        m.put("endTime", s.getEndTime());
        m.put("room", s.getRoom());
        m.put("notes", s.getNotes());
        return m;
    }
}
