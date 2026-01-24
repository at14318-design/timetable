import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";

type EventItem = {
  _id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  reminder?: boolean;
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate hourly intervals from 8:00 to 18:00
const times = Array.from({ length: 11 }).map((_, i) => {
  const hour = 8 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

// Slot height in pixels for each time row. Paper height will scale with `rowSpan * SLOT_HEIGHT`.
const SLOT_HEIGHT = 72;

// Helper function to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

// Helper function to check if two time ranges overlap
const timesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return !(e1 <= s2 || e2 <= s1);
};

const TimetablePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<EventItem>>({
    day: days[0],
    startTime: "08:00",
    endTime: "09:00",
    subject: "",
    reminder: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const eventsByCell = useMemo(() => {
    const map: Record<string, { event: EventItem; rowSpan: number }> = {};

    events.forEach((e) => {
      const eventStartMinutes = timeToMinutes(e.startTime);
      const eventEndMinutes = timeToMinutes(e.endTime);

      // Find start index: closest slot <= event start
      let startIdx = 0;
      for (let i = times.length - 1; i >= 0; i--) {
        if (timeToMinutes(times[i]) <= eventStartMinutes) {
          startIdx = i;
          break;
        }
      }

      // Find end index: first slot that contains or is after event end
      let endIdx = times.length - 1;
      for (let i = 0; i < times.length; i++) {
        const slotStart = timeToMinutes(times[i]);
        const nextSlotStart =
          i + 1 < times.length ? timeToMinutes(times[i + 1]) : slotStart + 30;
        if (eventEndMinutes <= nextSlotStart) {
          endIdx = i;
          break;
        }
      }

      const rowSpan = endIdx - startIdx + 1;
      const key = `${e.day}|${times[startIdx]}`;
      map[key] = { event: e, rowSpan };
    });

    return map;
  }, [events]);

  const skippedCells = useMemo(() => {
    const skip = new Set<string>();

    events.forEach((e) => {
      const eventStartMinutes = timeToMinutes(e.startTime);
      const eventEndMinutes = timeToMinutes(e.endTime);

      // Find start index
      let startIdx = 0;
      for (let i = times.length - 1; i >= 0; i--) {
        if (timeToMinutes(times[i]) <= eventStartMinutes) {
          startIdx = i;
          break;
        }
      }

      // Find end index
      let endIdx = times.length - 1;
      for (let i = 0; i < times.length; i++) {
        const slotStart = timeToMinutes(times[i]);
        const nextSlotStart =
          i + 1 < times.length ? timeToMinutes(times[i + 1]) : slotStart + 30;
        if (eventEndMinutes <= nextSlotStart) {
          endIdx = i;
          break;
        }
      }

      // Mark subsequent cells as skipped (covered by rowSpan)
      for (let i = startIdx + 1; i <= endIdx; i++) {
        const key = `${e.day}|${times[i]}`;
        skip.add(key);
      }
    });

    return skip;
  }, [events]);

  // Fetch timetable events on mount
  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/timetable/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEvents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setEditingId(null);
    setForm({
      day: days[0],
      startTime: "08:00",
      endTime: "09:00",
      subject: "",
      reminder: false,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (field: keyof EventItem) => (e: any) => {
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleAdd = async () => {
    if (!form.day || !form.startTime || !form.endTime || !form.subject) {
      setError("All fields are required");
      return;
    }

    // Validate times
    if (form.startTime! >= form.endTime!) {
      setError("Start time must be before end time");
      return;
    }

    // Check for duplicate/overlapping events (only when creating new event)
    if (!editingId) {
      const conflictingEvent = events.find(
        (e) =>
          e.day === form.day &&
          timesOverlap(e.startTime, e.endTime, form.startTime!, form.endTime!),
      );

      if (conflictingEvent) {
        setError(
          `A conflict exists with "${conflictingEvent.subject}" at ${conflictingEvent.startTime}-${conflictingEvent.endTime}`,
        );
        return;
      }
    }

    try {
      setError("");
      if (editingId) {
        // Update existing event
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/timetable/${editingId}`,
          {
            subject: form.subject,
            day: form.day,
            startTime: form.startTime,
            endTime: form.endTime,
            reminder: form.reminder,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setEvents(events.map((e) => (e._id === editingId ? response.data : e)));
      } else {
        // Create new event
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/timetable`,
          {
            subject: form.subject,
            day: form.day,
            startTime: form.startTime,
            endTime: form.endTime,
            userId,
            reminder: form.reminder,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setEvents([...events, response.data]);
      }
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleEdit = (event: EventItem) => {
    setEditingId(event._id || null);
    setForm({
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
      subject: event.subject,
      reminder: event.reminder || false,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setError("");
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/timetable/${eventToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEvents(events.filter((e) => e._id !== eventToDelete));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  return (
    <Box sx={{ px: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" href="/" sx={{ cursor: "pointer" }}>
          Home
        </Link>
        <Typography color="textPrimary">Timetable</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">My Timetable</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 100 }}>Time</TableCell>
                {days.map((d) => (
                  <TableCell key={d} align="center">
                    {d}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {times.map((t) => (
                <TableRow key={t} sx={{ height: SLOT_HEIGHT }}>
                  <TableCell>{t}</TableCell>
                  {days.map((d) => {
                    const key = `${d}|${t}`;

                    // Skip cells covered by rowSpan
                    if (skippedCells.has(key)) {
                      return null;
                    }

                    const eventData = eventsByCell[key];

                    if (eventData) {
                      return (
                        <TableCell
                          key={d}
                          rowSpan={eventData.rowSpan}
                          sx={{ minWidth: 140, verticalAlign: "top" }}
                        >
                          <Paper
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                              cursor: "pointer",
                              // Ensure the Paper visually spans the combined rows
                              minHeight: `${
                                eventData.rowSpan * SLOT_HEIGHT - 12
                              }px`,
                              display: "flex",
                              flexDirection: "column",
                            }}
                            onClick={() => handleEdit(eventData.event)}
                          >
                            <Typography variant="subtitle2">
                              {eventData.event.subject}
                            </Typography>
                            <Typography variant="caption">
                              {eventData.event.startTime} -{" "}
                              {eventData.event.endTime}
                            </Typography>
                            <Box sx={{ mt: 0.5, display: "flex", gap: 0.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.65rem",
                                  padding: "2px 4px",
                                  color: "inherit",
                                  borderColor: "inherit",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(eventData.event);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="contained"
                                sx={{
                                  fontSize: "0.65rem",
                                  padding: "2px 4px",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(eventData.event._id || "");
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          </Paper>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={d}
                        sx={{ minWidth: 140, verticalAlign: "top" }}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingId ? "Edit Event" : "Add Timetable Event"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="day-label">Day</InputLabel>
              <Select
                labelId="day-label"
                value={form.day}
                label="Day"
                onChange={(e) =>
                  setForm((s) => ({ ...s, day: e.target.value }))
                }
              >
                {days.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Subject"
              value={form.subject}
              onChange={handleChange("subject")}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Start Time"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((s) => ({ ...s, startTime: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((s) => ({ ...s, endTime: e.target.value }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.reminder}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, reminder: e.target.checked }))
                  }
                />
              }
              label="Email Reminder (15 min before)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetablePage;
