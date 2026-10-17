
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  Settings,
  Search,
  Bell,
  ChevronDown,
  MapPin,
  Mail,
  TrendingUp,
  LoaderCircle,
  X,
  Clock,
  CheckCircle,
  Building2,
  MapPinned,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/candidates";

const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

// Sample vacancies for the Job Openings page.
// These are frontend demo records, not saved in MongoDB.
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    openings: 2,
    status: "Open",
  },
  {
    id: 2,
    title: "Backend Developer",
    department: "Engineering",
    location: "Bengaluru",
    type: "Full-time",
    openings: 1,
    status: "Open",
  },
  {
    id: 3,
    title: "Data Analyst",
    department: "Analytics",
    location: "Hybrid",
    type: "Full-time",
    openings: 2,
    status: "Open",
  },
];

function App() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    skills: "",
    experience: 0,
    status: "Applied",
  };

  const [formData, setFormData] = useState(emptyForm);

  async function loadCandidates() {
    try {
      setLoading(true);

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load candidates.");
      }

      const data = await response.json();
      setCandidates(data);
      setError("");
    } catch {
      setError(
        "Unable to connect to the backend. Make sure your server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  const count = (stage) =>
    candidates.filter((candidate) => candidate.status === stage).length;

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name?.toLowerCase().includes(query) ||
        candidate.email?.toLowerCase().includes(query) ||
        candidate.jobTitle?.toLowerCase().includes(query) ||
        candidate.skills?.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesStatus =
        status === "All" || candidate.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, status]);

  async function handleAddCandidate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          experience: Number(formData.experience),
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add candidate.");
      }

      setShowForm(false);
      setFormData(emptyForm);
      await loadCandidates();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditCandidate(event) {
    event.preventDefault();

    if (!editingCandidate?._id) {
      setFormError("Please select a candidate to edit.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        `${API}/${editingCandidate._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            experience: Number(formData.experience),
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update candidate.");
      }

      setShowForm(false);
      setEditingCandidate(null);
      setFormData(emptyForm);
      await loadCandidates();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCandidate(candidate) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${candidate.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${candidate._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete candidate.");
      }

      await loadCandidates();
    } catch (err) {
      window.alert(err.message);
    }
  }

  function openAddForm() {
    setEditingCandidate(null);
    setFormData({ ...emptyForm });
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(candidate) {
    setEditingCandidate(candidate);

    setFormData({
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      jobTitle: candidate.jobTitle || "",
      skills: (candidate.skills || []).join(", "),
      experience: candidate.experience ?? 0,
      status: candidate.status || "Applied",
    });

    setFormError("");
    setShowForm(true);
  }

  function navigate(section) {
    setActiveSection(section);
    setShowNotifications(false);

    if (section === "candidates") {
      setStatus("All");
    }
  }

  const notifications = [
    {
      id: 1,
      title: `${count("Applied")} new application stage candidate(s)`,
      detail: "Candidates currently in Applied status",
      icon: UserPlus,
    },
    {
      id: 2,
      title: `${count("Interview")} candidate(s) in interview stage`,
      detail: "Review your interview-stage candidates",
      icon: CalendarDays,
    },
    {
      id: 3,
      title: `${count("Offer")} offer-stage candidate(s)`,
      detail: "Check candidates awaiting an offer decision",
      icon: CheckCircle,
    },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    candidates: "Candidates",
    jobs: "Job Openings",
    interviews: "Interviews",
    settings: "Settings",
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <span>
            mini<span className="brand-accent">ATS</span>
          </span>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        <nav>
          <button
            type="button"
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => navigate("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === "candidates" ? "active" : ""}`}
            onClick={() => navigate("candidates")}
          >
            <Users size={19} />
            Candidates
            <span className="nav-count">{candidates.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === "jobs" ? "active" : ""}`}
            onClick={() => navigate("jobs")}
          >
            <BriefcaseBusiness size={19} />
            Job Openings
            <span className="nav-count">{SAMPLE_JOBS.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === "interviews" ? "active" : ""}`}
            onClick={() => navigate("interviews")}
          >
            <CalendarDays size={19} />
            Interviews
            <span className="nav-count">{count("Interview")}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <TrendingUp size={19} />
            </div>
            <strong>Your hiring hub</strong>
            <p>Keep every candidate moving forward.</p>
          </div>

          <button
            type="button"
            className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="profile">
            <div className="avatar">R</div>
            <div>
              <strong>Recruiter</strong>
              <small>Administrator</small>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {pageTitles[activeSection]}
          </div>

          <div className="top-actions">
            <span className="today">Recruitment workspace</span>

            <div className="notification-wrapper">
              <button
                type="button"
                className="icon-button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((previous) => !previous)}
              >
                <Bell size={19} />
                <i />
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-heading">
                    <div>
                      <h3>Notifications</h3>
                      <p>Your recruitment overview</p>
                    </div>

                    <button
                      type="button"
                      className="panel-close"
                      aria-label="Close notifications"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {notifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <div
                        className="notification-item"
                        key={notification.id}
                      >
                        <div className="notification-icon">
                          <Icon size={18} />
                        </div>
                        <div>
                          <strong>{notification.title}</strong>
                          <p>{notification.detail}</p>
                        </div>
                      </div>
                    );
                  })}

                  <p className="notification-note">
                    These alerts are calculated from your current candidate records.
                  </p>
                </div>
              )}
            </div>

            <div className="avatar">R</div>
          </div>
        </header>

        {error && <p className="error-message">{error}</p>}

        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">YOUR RECRUITMENT, SIMPLIFIED</p>
                <h1>Hiring dashboard <span>✳</span></h1>
                <p className="subtitle">
                  Track candidates and keep your hiring pipeline moving.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={openAddForm}
              >
                <UserPlus size={18} /> Add Candidate
              </button>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total candidates</span>
                  <div className="stat-icon purple"><Users size={20} /></div>
                </div>
                <h2>{candidates.length}</h2>
                <p className="stat-note">All candidate records</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Applied</span>
                  <div className="stat-icon blue"><UserPlus size={20} /></div>
                </div>
                <h2>{count("Applied")}</h2>
                <p className="stat-note">New applications</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>In screening</span>
                  <div className="stat-icon orange"><Search size={20} /></div>
                </div>
                <h2>{count("Screening")}</h2>
                <p className="stat-note">Under review</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Hired</span>
                  <div className="stat-icon green"><TrendingUp size={20} /></div>
                </div>
                <h2>{count("Hired")}</h2>
                <p className="stat-note">Successful hires</p>
              </article>
            </section>

            <section className="pipeline-card">
              <div>
                <p className="eyebrow">HIRING PIPELINE</p>
                <h3>Candidate progress</h3>
              </div>

              <div className="pipeline-steps">
                {["Applied", "Screening", "Interview", "Offer", "Hired"].map(
                  (stage, index) => (
                    <button
                      type="button"
                      key={stage}
                      className="pipeline-step"
                      onClick={() => {
                        setStatus(stage);
                        navigate("candidates");
                        setStatus(stage);
                      }}
                    >
                      <span className={`step-dot step-${index}`} />
                      <span>{stage}</span>
                      <strong>{count(stage)}</strong>
                    </button>
                  )
                )}
              </div>
            </section>

            <CandidateTable
              candidates={candidates}
              filtered={filtered}
              loading={loading}
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              onRefresh={loadCandidates}
              onEdit={openEditForm}
              onDelete={handleDeleteCandidate}
              onAdd={openAddForm}
            />
          </>
        )}

        {/* CANDIDATES */}
        {activeSection === "candidates" && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">YOUR TALENT POOL</p>
                <h1>Manage candidates</h1>
                <p className="subtitle">
                  Search applications, update hiring stages, and manage candidate records.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={openAddForm}
              >
                <UserPlus size={18} /> Add Candidate
              </button>
            </section>

            <CandidateTable
              candidates={candidates}
              filtered={filtered}
              loading={loading}
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              onRefresh={loadCandidates}
              onEdit={openEditForm}
              onDelete={handleDeleteCandidate}
              onAdd={openAddForm}
            />
          </>
        )}

        {/* JOB OPENINGS */}
        {activeSection === "jobs" && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">GROW YOUR TEAM</p>
                <h1>Job openings</h1>
                <p className="subtitle">
                  Explore vacancies and see how many candidates are associated with each role.
                </p>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Open positions</span>
                  <div className="stat-icon purple">
                    <BriefcaseBusiness size={20} />
                  </div>
                </div>
                <h2>{SAMPLE_JOBS.filter((job) => job.status === "Open").length}</h2>
                <p className="stat-note">Sample vacancies</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Total applicants</span>
                  <div className="stat-icon blue"><Users size={20} /></div>
                </div>
                <h2>{candidates.length}</h2>
                <p className="stat-note">Across all roles</p>
              </article>
            </section>

            <section className="candidates-card">
              <div className="section-header">
                <div>
                  <h3>Available positions</h3>
                  <p>Sample job listings for your ATS demonstration.</p>
                </div>
              </div>

              <div className="job-list">
                {SAMPLE_JOBS.map((job) => {
                  const applicantCount = candidates.filter(
                    (candidate) =>
                      candidate.jobTitle?.toLowerCase() === job.title.toLowerCase()
                  ).length;

                  return (
                    <article className="job-card" key={job.id}>
                      <div className="job-card-top">
                        <div className="job-card-icon">
                          <BriefcaseBusiness size={22} />
                        </div>
                        <span className="status-badge status-hired">
                          {job.status}
                        </span>
                      </div>

                      <h3>{job.title}</h3>

                      <p className="job-department">
                        <Building2 size={15} /> {job.department}
                      </p>

                      <div className="job-details">
                        <span><MapPinned size={15} /> {job.location}</span>
                        <span><Clock size={15} /> {job.type}</span>
                      </div>

                      <div className="job-card-footer">
                        <div>
                          <strong>{applicantCount}</strong>
                          <small>Matching applicants</small>
                        </div>
                        <div>
                          <strong>{job.openings}</strong>
                          <small>Vacancies</small>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setSearch(job.title);
                            setStatus("All");
                            navigate("candidates");
                          }}
                        >
                          View applicants
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="notification-note">
                Job listings are demo data stored in App.jsx. Add a Jobs API and MongoDB model to manage real vacancies.
              </p>
            </section>
          </>
        )}

        {/* INTERVIEWS */}
        {activeSection === "interviews" && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">NEXT STEPS IN HIRING</p>
                <h1>Interviews</h1>
                <p className="subtitle">
                  Review candidates currently in the Interview hiring stage.
                </p>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Interview-stage candidates</span>
                  <div className="stat-icon purple">
                    <CalendarDays size={20} />
                  </div>
                </div>
                <h2>{count("Interview")}</h2>
                <p className="stat-note">Candidates marked Interview</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Offers</span>
                  <div className="stat-icon green">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <h2>{count("Offer")}</h2>
                <p className="stat-note">Candidates at offer stage</p>
              </article>
            </section>

            <section className="candidates-card">
              <div className="section-header">
                <div>
                  <h3>Interview pipeline</h3>
                  <p>Use Edit to update a candidate's hiring stage.</p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={loadCandidates}
                >
                  <LoaderCircle size={16} /> Refresh
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CANDIDATE</th>
                      <th>POSITION</th>
                      <th>EMAIL</th>
                      <th>STAGE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          Loading candidates...
                        </td>
                      </tr>
                    ) : candidates.filter(
                      (candidate) => candidate.status === "Interview"
                    ).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No candidates are in the Interview stage yet. Edit a candidate and change their hiring status to Interview.
                        </td>
                      </tr>
                    ) : (
                      candidates
                        .filter((candidate) => candidate.status === "Interview")
                        .map((candidate) => (
                          <tr key={candidate._id}>
                            <td>
                              <div className="candidate-cell">
                                <div className="candidate-avatar">
                                  {candidate.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div><strong>{candidate.name}</strong></div>
                              </div>
                            </td>
                            <td>{candidate.jobTitle}</td>
                            <td>{candidate.email}</td>
                            <td>
                              <span className="status-badge status-interview">
                                Interview
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="row-action"
                                onClick={() => openEditForm(candidate)}
                              >
                                Edit stage
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* SETTINGS */}
        {activeSection === "settings" && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">WORKSPACE PREFERENCES</p>
                <h1>Settings</h1>
                <p className="subtitle">
                  Basic information about your Mini ATS workspace.
                </p>
              </div>
            </section>

            <section className="candidates-card settings-card">
              <h3>Workspace settings</h3>
              <p><strong>Application:</strong> Mini ATS</p>
              <p><strong>Role:</strong> Recruiter / Administrator</p>
              <p><strong>Candidate records:</strong> {candidates.length}</p>
              <p><strong>Backend API:</strong> {API}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={loadCandidates}
              >
                <LoaderCircle size={16} /> Refresh candidate data
              </button>
            </section>
          </>
        )}

        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowForm(false);
              setEditingCandidate(null);
            }}
          >
            <div
              className="candidate-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>
                    {editingCandidate ? "Edit Candidate" : "Add Candidate"}
                  </h2>
                  <p>Enter the candidate's details below.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCandidate(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  editingCandidate
                    ? handleEditCandidate
                    : handleAddCandidate
                }
              >
                <label>
                  Full name *
                  <input
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({ ...formData, name: event.target.value })
                    }
                    placeholder="e.g. Aarav Sharma"
                  />
                </label>

                <label>
                  Email address *
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
                    }
                    placeholder="candidate@example.com"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData({ ...formData, phone: event.target.value })
                    }
                    placeholder="Phone number"
                  />
                </label>

                <label>
                  Job title *
                  <input
                    required
                    value={formData.jobTitle}
                    onChange={(event) =>
                      setFormData({ ...formData, jobTitle: event.target.value })
                    }
                    placeholder="e.g. Frontend Developer"
                  />
                </label>

                <label>
                  Skills
                  <input
                    value={formData.skills}
                    onChange={(event) =>
                      setFormData({ ...formData, skills: event.target.value })
                    }
                    placeholder="React, JavaScript, MongoDB"
                  />
                  <small>Separate skills with commas.</small>
                </label>

                <div className="form-row">
                  <label>
                    Experience (years)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.experience}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          experience: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Hiring status
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({ ...formData, status: event.target.value })
                      }
                    >
                      {STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {formError && (
                  <p className="error-message">{formError}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCandidate(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCandidate
                        ? "Update Candidate"
                        : "Save Candidate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer>Mini ATS <span>·</span> Applicant Tracking System</footer>
      </main>
    </div>
  );
}

function CandidateTable({
  candidates,
  filtered,
  loading,
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
  onEdit,
  onDelete,
  onAdd,
}) {
  return (
    <section className="candidates-card">
      <div className="section-header">
        <div>
          <h3>Candidates</h3>
          <p>Manage and review your talent pool.</p>
        </div>

        <div className="table-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onRefresh}
          >
            <LoaderCircle size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search name, email, role or skill..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {["All", ...STAGES].map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All statuses" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CANDIDATE</th>
              <th>POSITION</th>
              <th>SKILLS</th>
              <th>EXPERIENCE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  Loading candidates...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {candidates.length === 0
                    ? "No candidates yet. Click Add Candidate to get started."
                    : "No candidates match your search or status filter."}
                </td>
              </tr>
            ) : (
              filtered.map((candidate) => (
                <tr key={candidate._id}>
                  <td>
                    <div className="candidate-cell">
                      <div className="candidate-avatar">
                        {candidate.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <strong>{candidate.name}</strong>
                        <small>
                          <Mail size={12} /> {candidate.email}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="job-title">
                      <BriefcaseBusiness size={14} />
                      {candidate.jobTitle}
                    </span>
                  </td>

                  <td>
                    <div className="skills">
                      {(candidate.skills || []).slice(0, 3).map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </td>

                  <td>
                    {candidate.experience ?? 0}{" "}
                    {candidate.experience === 1 ? "year" : "years"}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${candidate.status?.toLowerCase()}`}
                    >
                      {candidate.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="row-action"
                      onClick={() => onEdit(candidate)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="row-action"
                      onClick={() => onDelete(candidate)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>
          Showing {filtered.length} of {candidates.length} candidates
        </span>
        <span><MapPin size={14} /> Candidate database</span>
      </div>
    </section>
  );
}

export default App;
