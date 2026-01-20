import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./GroupsManagement.css";

interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  members: Array<{
    _id: string;
    username: string;
    email: string;
  }>;
}

const GroupsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const token = localStorage.getItem("authToken");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      setError("");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/groups`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups([...groups, response.data]);
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleAddMember = async (groupId: string) => {
    if (!addMemberEmail.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setError("");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/members`,
        { email: addMemberEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGroups(groups.map((g) => (g._id === groupId ? response.data : g)));
      setAddMemberEmail("");
      setSelectedGroup(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      setError("");
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGroups(groups.map((g) => (g._id === groupId ? response.data : g)));
      setSelectedGroup(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }

    try {
      setError("");
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGroups(groups.filter((g) => g._id !== groupId));
      setSelectedGroup(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete group");
    }
  };

  const handleViewSchedule = (groupId: string) => {
    navigate(`/group-schedule/${groupId}`);
  };

  const isGroupCreator = (group: Group) =>
    group.createdBy._id === currentUserId;

  return (
    <div className="groups-management">
      <div className="groups-container">
        <div className="groups-header">
          <h1>Group Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "+ Create Group"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showCreateForm && (
          <form className="create-group-form" onSubmit={handleCreateGroup}>
            <input
              type="text"
              placeholder="Group Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <textarea
              placeholder="Group Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
            <button type="submit" className="btn btn-success">
              Create Group
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="no-groups">No groups yet. Create one to get started!</p>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <div
                key={group._id}
                className={`group-card ${
                  selectedGroup?._id === group._id ? "selected" : ""
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="group-card-header">
                  <h2>{group.name}</h2>
                  {isGroupCreator(group) && (
                    <span className="creator-badge">Creator</span>
                  )}
                </div>
                {group.description && (
                  <p className="group-description">{group.description}</p>
                )}
                <div className="group-info">
                  <p>
                    <strong>Members:</strong> {group.members.length}
                  </p>
                  <p>
                    <strong>Created by:</strong> {group.createdBy.username}
                  </p>
                </div>
                <div className="group-card-actions">
                  <button
                    className="btn btn-small btn-info"
                    onClick={() => handleViewSchedule(group._id)}
                  >
                    View Schedule
                  </button>
                  {isGroupCreator(group) && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteGroup(group._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedGroup && (
          <div className="group-details-panel">
            <div className="panel-header">
              <h2>{selectedGroup.name}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedGroup(null)}
              >
                ✕
              </button>
            </div>

            {selectedGroup.description && (
              <p className="description">{selectedGroup.description}</p>
            )}

            <div className="members-section">
              <h3>Members ({selectedGroup.members.length})</h3>
              <ul className="members-list">
                {selectedGroup.members.map((member) => (
                  <li key={member._id} className="member-item">
                    <span>
                      {member.username} ({member.email})
                    </span>
                    {isGroupCreator(selectedGroup) &&
                      member._id !== selectedGroup.createdBy._id && (
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() =>
                            handleRemoveMember(selectedGroup._id, member._id)
                          }
                        >
                          Remove
                        </button>
                      )}
                  </li>
                ))}
              </ul>

              {isGroupCreator(selectedGroup) && (
                <div className="add-member-form">
                  <input
                    type="email"
                    placeholder="Enter user email to add"
                    value={addMemberEmail}
                    onChange={(e) => setAddMemberEmail(e.target.value)}
                  />
                  <button
                    className="btn btn-success"
                    onClick={() => handleAddMember(selectedGroup._id)}
                  >
                    Add Member
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsManagement;
