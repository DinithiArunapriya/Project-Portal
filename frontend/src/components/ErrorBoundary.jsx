import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  onReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/"; // reset app state
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>Something went wrong</div>
          <div style={{ marginTop: 8, color: "#6b7280" }}>
            The app crashed due to a runtime error. You can refresh the page or reset.
          </div>

          <pre style={styles.pre}>
            {String(this.state.error?.message || this.state.error || "Unknown error")}
          </pre>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button style={styles.btn} onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button style={styles.primaryBtn} onClick={this.onReset}>
              Reset App
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "#f9fafb",
  },
  card: {
    width: "min(720px, 100%)",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
  },
  pre: {
    marginTop: 10,
    background: "#111827",
    color: "white",
    padding: 12,
    borderRadius: 12,
    overflowX: "auto",
    fontSize: 12,
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },
};
