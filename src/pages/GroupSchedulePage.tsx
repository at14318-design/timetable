import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GroupSchedulePage.css";

interface Schedule {
  _id: string;
  title: string;
  description?: string;
  day: string;
  startTime: string;
  endTime: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
}

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
// const times = Array.from({ length: 11 }).map((_, i) => {
//   const hour = 8 + i;
//   return `${String(hour).padStart(2, "0")}:00`;
// });

// Helper function to convert time string to minutes
// const timeToMinutes = (time: string): number => {
//   const [hour, minute] = time.split(":").map(Number);
//   return hour * 60 + minute;
// };

const GroupSchedulePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (groupId) {
      fetchGroupAndSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupAndSchedules = async () => {
    try {
      setLoading(true);
      setError("");
      const [groupRes, schedulesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/schedules/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setGroup(groupRes.data);
      setSchedules(schedulesRes.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch group and schedules"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      let response: any;

      if (editingId) {
        response = await axios.put(
          `http://localhost:5000/api/schedules/${editingId}`,
          {
            ...formData,
            groupId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSchedules(
          schedules.map((s) => (s._id === editingId ? response.data : s))
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/schedules",
          {
            ...formData,
            groupId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSchedules([...schedules, response.data]);
      }

      setFormData({
        title: "",
        description: "",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
      });
      setShowCreateForm(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save schedule");
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setEditingId(schedule._id);
    setShowCreateForm(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      setError("");
      await axios.delete(`http://localhost:5000/api/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(schedules.filter((s) => s._id !== scheduleId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
    });
    setError("");
  };

  const schedulesByDay = days.map((day) =>
    schedules
      .filter((s) => s.day === day)
      .sort((a, b) => {
        const aTime = parseInt(a.startTime.replace(":", ""));
        const bTime = parseInt(b.startTime.replace(":", ""));
        return aTime - bTime;
      })
  );

  const isScheduleCreator = (schedule: Schedule) =>
    schedule.createdBy._id === currentUserId;

  if (loading) return <div className="loading">Loading schedule...</div>;

  if (!group) {
    return (
      <div className="error-container">
        <p>{error || "Group not found"}</p>
        <button className="btn btn-primary" onClick={() => navigate("/groups")}>
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="group-schedule-page">
      <div className="schedule-header">
        <div className="header-info">
          <button className="back-btn" onClick={() => navigate("/groups")}>
            ← Back
          </button>
          <div>
            <h1>{group.name} Schedule</h1>
            {group.description && (
              <p className="group-desc">{group.description}</p>
            )}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (editingId) handleCancel();
            else setShowCreateForm(!showCreateForm);
          }}
        >
          {editingId ? "Cancel" : showCreateForm ? "Close" : "+ Add Schedule"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <form className="schedule-form" onSubmit={handleCreateOrUpdateSchedule}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Team Meeting, Project Work"
                required
              />
            </div>
            <div className="form-group">
              <label>Day *</label>
              <select
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
                required
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingId ? "Update Schedule" : "Add Schedule"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="schedule-grid">
        {schedulesByDay.map((daySchedules, dayIndex) => (
          <div key={dayIndex} className="day-column">
            <div className="day-header">{days[dayIndex]}</div>
            <div className="schedule-list">
              {daySchedules.length === 0 ? (
                <p className="no-schedule">No schedule</p>
              ) : (
                daySchedules.map((schedule) => (
                  <div key={schedule._id} className="schedule-item">
                    <div className="schedule-time">
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="schedule-content">
                      <h3>{schedule.title}</h3>
                      {schedule.description && <p>{schedule.description}</p>}
                      <div className="schedule-meta">
                        <span className="creator">
                          by {schedule.createdBy.username}
                        </span>
                      </div>
                    </div>
                    {isScheduleCreator(schedule) && (
                      <div className="schedule-actions">
                        <button
                          className="btn btn-small btn-info"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteSchedule(schedule._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupSchedulePage;
