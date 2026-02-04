import { useState } from "react";
import MainLayout from "../layouts/MainLayout";

const steps = [
  "Basic Information",
  "Timeline",
  "Team Information",
  "Project Details",
  "Additional Information",
];

const CreateProject = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Header */}
        <h2 style={styles.title}>Create New Project</h2>
        <p style={styles.subtitle}>
          Follow the steps below to create your project
        </p>

        {/* Step Info */}
        <div style={styles.stepInfo}>
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{progress}% Complete</span>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Step Tabs */}
        <div style={styles.stepTabs}>
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                ...styles.stepTab,
                ...(index === currentStep ? styles.activeStep : {}),
              }}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          {currentStep === 0 && <BasicInformation />}

          {currentStep !== 0 && (
            <div style={styles.placeholder}>
              <h3>{steps[currentStep]}</h3>
              <p>This step will be implemented next.</p>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.cancelBtn}>Cancel</button>
            <div>
              {currentStep > 0 && (
                <button style={styles.secondaryBtn} onClick={prevStep}>
                  Back
                </button>
              )}
              <button style={styles.primaryBtn} onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

/* ---------------- BASIC INFO STEP ---------------- */

const BasicInformation = () => {
  return (
    <>
      <h3 style={styles.sectionTitle}>Basic Information</h3>
      <p style={styles.sectionDesc}>
        Project name, category, status, and priority
      </p>

      <div style={styles.formGrid}>
        <div>
          <label>Project Name *</label>
          <input
            type="text"
            placeholder="Enter project name"
            style={styles.input}
          />
        </div>

        <div>
          <label>Category *</label>
          <select style={styles.input}>
            <option>Select category</option>
            <option>Web Development</option>
            <option>Mobile Development</option>
            <option>Backend</option>
            <option>Data & Analytics</option>
          </select>
        </div>
      </div>

      {/* Status */}
      <div style={styles.fieldGroup}>
        <label>Status</label>
        <div style={styles.optionGroup}>
          {["Ongoing", "Completed", "On Hold"].map((s) => (
            <button key={s} style={styles.optionBtn}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div style={styles.fieldGroup}>
        <label>Priority</label>
        <div style={styles.optionGroup}>
          {["Low", "Medium", "High", "Urgent"].map((p) => (
            <button key={p} style={styles.optionBtn}>
              {p}
            </button>
          ))}
        </div>
      </div>

        {/* Due Date */}
      <div style={styles.fieldGroup}>
        <label>Due Date</label>
        <div style={styles.optionGroup}>
          {["Low", "Medium", "High", "Urgent"].map((p) => (
            <button key={p} style={styles.optionBtn}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={styles.fieldGroup}>
        <label>Progress</label>
        <select style={styles.input}>
          <option>0%</option>
          <option>25%</option>
          <option>50%</option>
          <option>75%</option>
          <option>100%</option>
        </select>
      </div>
    </>
  );
};

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "26px",
    fontWeight: 600,
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: "20px",
  },
  stepInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
  },
  progressBar: {
    height: "8px",
    background: "#E5E7EB",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  progressFill: {
    height: "100%",
    background: "#4F46E5",
    transition: "width 0.3s ease",
  },
  stepTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  stepTab: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#F3F4F6",
    fontSize: "14px",
  },
  activeStep: {
    background: "#4F46E5",
    color: "#fff",
  },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  sectionDesc: {
    color: "#6B7280",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #E5E7EB",
    marginTop: "6px",
  },
  fieldGroup: {
    marginBottom: "20px",
  },
  optionGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
  optionBtn: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
  },
  primaryBtn: {
    background: "#4F46E5",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#F3F4F6",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    marginRight: "10px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "transparent",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
  },
  placeholder: {
    textAlign: "center",
    padding: "40px 0",
    color: "#6B7280",
  },
};

export default CreateProject;
