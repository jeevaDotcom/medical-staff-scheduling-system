const API = 'http://localhost:8080/api';

async function apiFetch(url, options = {}) {
    try {
        const token = localStorage.getItem('medsched_token');
        const reqHeaders = { 'Content-Type': 'application/json', ...options.headers };
        if (token) reqHeaders['Authorization'] = `Bearer ${token}`;

        const res = await fetch(API + url, {
            ...options,
            headers: reqHeaders
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.warn('[API]', url, e.message);
        throw e;
    }
}

// ── STAFF ──────────────────────────────────────────────────────
const StaffAPI = {
    getAll: (name, dept, role) => {
        const p = new URLSearchParams();
        if (name) p.set('name', name);
        if (dept) p.set('dept', dept);
        if (role) p.set('role', role);
        return apiFetch('/staff?' + p.toString());
    },
    getById: (id)        => apiFetch(`/staff/${id}`),
    create:  (data)      => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update:  (id, data)  => apiFetch(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:  (id)        => apiFetch(`/staff/${id}`, { method: 'DELETE' }),
    getDepts:()          => apiFetch('/staff/departments'),
    getRoles:()          => apiFetch('/staff/roles'),
};

// ── ATTENDANCE ────────────────────────────────────────────────
const AttendanceAPI = {
    getToday:   ()       => apiFetch('/attendance/today'),
    getByDate:  (date)   => apiFetch(`/attendance/date/${date}`),
    checkIn:    (id)     => apiFetch(`/attendance/checkin/${id}`, { method: 'POST' }),
    checkOut:   (id)     => apiFetch(`/attendance/checkout/${id}`, { method: 'POST' }),
    create:     (data)   => apiFetch('/attendance', { method: 'POST', body: JSON.stringify(data) }),
};

// ── SHIFTS ────────────────────────────────────────────────────
const ShiftAPI = {
    getToday:   ()       => apiFetch('/shifts/today'),
    getByDate:  (date)   => apiFetch(`/shifts/date/${date}`),
    create:     (data)   => apiFetch('/shifts', { method: 'POST', body: JSON.stringify(data) }),
    update:     (id, d)  => apiFetch(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete:     (id)     => apiFetch(`/shifts/${id}`, { method: 'DELETE' }),
};

// ── LEAVE ─────────────────────────────────────────────────────
const LeaveAPI = {
    getAll:     (status) => apiFetch('/leave' + (status ? `?status=${status}` : '')),
    create:     (data)   => apiFetch('/leave', { method: 'POST', body: JSON.stringify(data) }),
    approve:    (id)     => apiFetch(`/leave/${id}/approve`, { method: 'PUT' }),
    reject:     (id)     => apiFetch(`/leave/${id}/reject`, { method: 'PUT' }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
const NotifAPI = {
    getAll:     ()       => apiFetch('/notifications'),
    getUnread:  ()       => apiFetch('/notifications/unread'),
    getCount:   ()       => apiFetch('/notifications/count'),
    markRead:   (id)     => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead:()       => apiFetch('/notifications/read-all', { method: 'PUT' }),
};
