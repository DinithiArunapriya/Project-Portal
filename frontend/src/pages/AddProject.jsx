import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import axios from "axios";
import { FaInfoCircle, FaCalendarAlt, FaUsers, FaFileAlt, FaClipboardList } from "react-icons/fa";

const steps = [
  { title: "Basic Info", icon: <FaInfoCircle /> },
  { title: "Timeline", icon: <FaCalendarAlt /> },
  { title: "Team Info", icon: <FaUsers /> },
  { title: "Project Details", icon: <FaFileAlt /> },
  { title: "Additional Info", icon: <FaClipboardList /> },
];

const AddProject = () => {
  const [step, setStep] = useState(0);

  // ----------- Form State -----------
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [priority, setPriority] = useState("Low");
  const [progress, setProgress] = useState(0);

  const [startDate, setStartDate] = useState("2026-01-17");
  const [endDate, setEndDate] = useState("");

  const [lead, setLead] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const [company, setCompany] = useState("");
  const [statusPhase, setStatusPhase] = useState("");
  const [deadline, setDeadline] = useState("");
  const [initiallyRaised, setInitiallyRaised] = useState("2026-01-17");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [developers, setDevelopers] = useState([]);

  const [remarks, setRemarks] = useState("");
  const [comments, setComments] = useState("");

  // ----------- Navigation -----------
  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const progressPercent = ((step + 1) / steps.length) * 100;

  // ----------- Validation & Submit -----------
  const handleCreate = async () => {
    if (!projectName || !lead) {
      alert("Please fill required fields: Project Name and Project Lead");
      return;
    }

    const projectData = {
      name: projectName,
      category,
      status,
      priority,
      progress,
      startDate,
      endDate,
      lead,
      teamMembers,
      company,
      statusPhase,
      deadline,
      initiallyRaised,
      responsiblePerson,
      developers,
      remarks,
      comments,
    };

    try {
      await axios.post("http://localhost:8080/projects", projectData);
      alert("Project created successfully!");
      // Optional: redirect to dashboard or projects page
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Error creating project. Check backend logs.");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>
        <h2 style={{ marginBottom: "8px" }}>Create New Project</h2>
        <p style={{ color: "#6B7280", marginBottom: "24px" }}>Follow the steps to create your project</p>

        {/* Progress bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
          <span>Step {step + 1} of {steps.length}</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <div style={{ height: "8px", background: "#E5E7EB", borderRadius: "4px", marginBottom: "24px" }}>
          <div style={{ width: `${progressPercent}%`, height: "100%", background: "#4F46E5", borderRadius: "4px" }} />
        </div>

        {/* Step Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", color: i === step ? "#4F46E5" : "#6B7280", fontWeight: i === step ? 600 : 400 }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
              {s.title}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          {step === 0 && <BasicInfoStep {...{projectName, setProjectName, category, setCategory, status, setStatus, priority, setPriority, progress, setProgress}} />}
          {step === 1 && <TimelineStep {...{startDate, setStartDate, endDate, setEndDate}} />}
          {step === 2 && <TeamInfoStep {...{lead, setLead, teamMembers, setTeamMembers}} />}
          {step === 3 && <ProjectDetailsStep {...{company, setCompany, statusPhase, setStatusPhase, deadline, setDeadline, initiallyRaised, responsiblePerson, setResponsiblePerson, developers, setDevelopers}} />}
          {step === 4 && <AdditionalInfoStep {...{remarks, setRemarks, comments, setComments}} />}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
          <button onClick={prevStep} disabled={step === 0} style={styles.navBtnSecondary}>Previous</button>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={styles.navBtnSecondary} onClick={() => window.location.href="/dashboard"}>Cancel</button>
            {step === steps.length - 1 
              ? <button onClick={handleCreate} style={styles.navBtnPrimary}>Create</button>
              : <button onClick={nextStep} style={styles.navBtnPrimary}>Next</button>
            }
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

/* ---------------- Step Components ---------------- */
const BasicInfoStep = ({projectName, setProjectName, category, setCategory, status, setStatus, priority, setPriority, progress, setProgress}) => (
  <div style={{ display: "grid", gap: "16px" }}>
    <div style={styles.field}>
      <label>Project Name *</label>
      <input value={projectName} onChange={(e)=>setProjectName(e.target.value)} placeholder="Enter project name" style={styles.input} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <div style={styles.field}>
        <label>Category *</label>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} style={styles.input}>
          <option value="">Select category</option>
          <option>Web</option>
          <option>Mobile</option>
          <option>Backend</option>
        </select>
      </div>
      <div style={styles.field}>
        <label>Status</label>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} style={styles.input}>
          <option>Ongoing</option>
          <option>Completed</option>
          <option>On Hold</option>
        </select>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <div style={styles.field}>
        <label>Priority</label>
        <select value={priority} onChange={(e)=>setPriority(e.target.value)} style={styles.input}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>
        </select>
      </div>
      <div style={styles.field}>
        <label>Progress</label>
        <select value={progress} onChange={(e)=>setProgress(Number(e.target.value))} style={styles.input}>
          <option value={0}>0%</option>
          <option value={25}>25%</option>
          <option value={50}>50%</option>
          <option value={75}>75%</option>
          <option value={100}>100%</option>
        </select>
      </div>
    </div>
  </div>
);

/* TimelineStep, TeamInfoStep, ProjectDetailsStep, AdditionalInfoStep remain similar but now all fields are connected with useState from parent */

const TimelineStep = ({startDate, setStartDate, endDate, setEndDate}) => {
  const getDuration = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = new Date(endDate) - new Date(startDate);
    return Math.max(Math.ceil(diffTime / (1000*60*60*24)), 0);
  };
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <p>Project start and end dates, duration</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={styles.field}>
          <label>Start Date *</label>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={styles.input} />
        </div>
        <div style={styles.field}>
          <label>End Date *</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={styles.input} />
        </div>
      </div>
      <p>Estimated Duration: {getDuration()} days</p>
    </div>
  );
};

const TeamInfoStep = ({lead, setLead, teamMembers, setTeamMembers}) => (
  <div style={{ display: "grid", gap: "16px" }}>
    <div style={styles.field}>
      <label>Project Lead *</label>
      <select value={lead} onChange={e=>setLead(e.target.value)} style={styles.input}>
        <option value="">Select lead</option>
        <option>Alice</option>
        <option>Bob</option>
      </select>
      {!lead && <small style={{color:"red"}}>Project lead is required</small>}
    </div>
    <div style={styles.field}>
      <label>Team Members</label>
      <select multiple value={teamMembers} onChange={e=>setTeamMembers([...e.target.selectedOptions].map(o=>o.value))} style={styles.input}>
        <option>Alice</option>
        <option>Bob</option>
        <option>Charlie</option>
        <option>Derek</option>
      </select>
    </div>
  </div>
);

const ProjectDetailsStep = ({company, setCompany, statusPhase, setStatusPhase, deadline, setDeadline, initiallyRaised, responsiblePerson, setResponsiblePerson, developers, setDevelopers}) => (
  <div style={{display:"grid", gap:"16px"}}>
    <div style={styles.field}><label>Company</label><input style={styles.input} value={company} onChange={e=>setCompany(e.target.value)} placeholder="Enter company name" /></div>
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
      <div style={styles.field}><label>Status Phase</label><select style={styles.input} value={statusPhase} onChange={e=>setStatusPhase(e.target.value)}><option value="">Select phase</option><option>Planning</option><option>Execution</option><option>Completed</option></select></div>
      <div style={styles.field}><label>Deadline</label><input type="date" style={styles.input} value={deadline} onChange={e=>setDeadline(e.target.value)} /></div>
    </div>
    <div style={styles.field}><label>Initially Raised On</label><input type="date" style={styles.input} value={initiallyRaised} disabled/></div>
    <p>People Assignment</p>
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
      <div style={styles.field}><label>Responsible Person</label><select style={styles.input} value={responsiblePerson} onChange={e=>setResponsiblePerson(e.target.value)}><option value="">Select</option><option>Alice</option><option>Bob</option></select></div>
      <div style={styles.field}><label>Developers</label><select multiple style={styles.input} value={developers} onChange={e=>setDevelopers([...e.target.selectedOptions].map(o=>o.value))}><option>Alice</option><option>Bob</option><option>Charlie</option></select></div>
    </div>
  </div>
);

const AdditionalInfoStep = ({remarks, setRemarks, comments, setComments}) => (
  <div style={{display:"grid", gap:"16px"}}>
    <div style={styles.field}><label>Project Remarks</label><textarea style={styles.textarea} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add project remarks..." /></div>
    <div style={styles.field}><label>General Comments</label><textarea style={styles.textarea} value={comments} onChange={e=>setComments(e.target.value)} placeholder="Add general project comments..." /></div>
  </div>
);

/* ---------------- Styles ---------------- */
const styles = {
  input:{padding:"12px", borderRadius:"8px", border:"1px solid #E5E7EB", width:"100%"},
  textarea:{padding:"12px", borderRadius:"8px", border:"1px solid #E5E7EB", width:"100%", minHeight:"80px"},
  field:{display:"flex", flexDirection:"column", gap:"6px"},
  navBtnPrimary:{padding:"10px 20px", borderRadius:"8px", border:"none", background:"#4F46E5", color:"#fff", cursor:"pointer"},
  navBtnSecondary:{padding:"10px 20px", borderRadius:"8px", border:"1px solid #E5E7EB", background:"#F9FAFB", cursor:"pointer"},
};

export default AddProject;
