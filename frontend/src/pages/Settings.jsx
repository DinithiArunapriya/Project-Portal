import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";

import PageHeader from "../components/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import {
  getSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateAppearanceSettings,
} from "../services/settingsApi";

const TABS = ["account", "profile", "notifications", "appearance"];

const COLOR_OPTIONS = [
  { value: "primary", label: "Blue", swatch: "#2563eb" },
  { value: "indigo", label: "Indigo", swatch: "#4f46e5" },
  { value: "purple", label: "Purple", swatch: "#7c3aed" },
  { value: "pink", label: "Pink", swatch: "#db2777" },
  { value: "red", label: "Red", swatch: "#dc2626" },
  { value: "orange", label: "Orange", swatch: "#ea580c" },
  { value: "green", label: "Green", swatch: "#16a34a" },
  { value: "teal", label: "Teal", swatch: "#0d9488" },
];

export default function Settings() {
  const { user, setUser } = useAuth();
  const notify = useNotify();

  const [activeTab, setActiveTab] = React.useState("account");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // profile + preferences (persisted)
  const [profile, setProfile] = React.useState({
    name: user?.name || "",
    jobTitle: "",
    department: "",
    bio: "",
    avatar: null,
  });

  const [notifications, setNotifications] = React.useState({
    email: true,
    push: true,
    taskReminders: true,
  });

  const [appearance, setAppearance] = React.useState({
    theme: "light",
    colorScheme: "primary",
  });

  // password form (not persisted)
  const [passwords, setPasswords] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });

  // snapshots for Cancel on profile tab
  const [profileSnapshot, setProfileSnapshot] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSettings();
      if (!data) throw new Error("Settings not found");

      setProfile((p) => ({
        ...p,
        name: user?.name || data.profile?.name || "",
        jobTitle: data.profile?.jobTitle || "",
        department: data.profile?.department || "",
        bio: data.profile?.bio || "",
        avatar: data.profile?.avatar || null,
      }));

      setNotifications({
        email: !!data.notifications?.email,
        push: !!data.notifications?.push,
        taskReminders: !!data.notifications?.taskReminders,
      });

      setAppearance({
        theme: data.appearance?.theme || "light",
        colorScheme: data.appearance?.colorScheme || "primary",
      });

      setProfileSnapshot({
        name: user?.name || data.profile?.name || "",
        jobTitle: data.profile?.jobTitle || "",
        department: data.profile?.department || "",
        bio: data.profile?.bio || "",
        avatar: data.profile?.avatar || null,
      });
    } catch (e) {
      setError(e?.message || "Failed to load settings");
      notify({ title: "Load failed", message: e?.message || "Failed to load settings", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify, user?.name]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Apply theme (simple demo): add data attributes on <html>
  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = appearance.theme;
    root.dataset.accent = appearance.colorScheme;
  }, [appearance.theme, appearance.colorScheme]);

  // ----------------------
  // Actions
  // ----------------------

  const updatePassword = async () => {
    if (!passwords.current) {
      return notify({ title: "Missing", message: "Please enter your current password", type: "error" });
    }
    if (!passwords.next) {
      return notify({ title: "Missing", message: "Please enter a new password", type: "error" });
    }
    if (passwords.next !== passwords.confirm) {
      return notify({ title: "Mismatch", message: "New passwords do not match", type: "error" });
    }

    // mock success
    notify({ title: "Password updated", message: "Password updated successfully", type: "success" });
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const saveProfile = async () => {
    try {
      const saved = await updateProfileSettings({
        name: profile.name,
        jobTitle: profile.jobTitle,
        department: profile.department,
        bio: profile.bio,
        avatar: profile.avatar,
      });

      // Update auth user name too (so header/sidebar shows new name)
      if (typeof setUser === "function") {
        setUser({ ...(user || {}), name: saved.name });
      }

      setProfileSnapshot({ ...profile });
      notify({ title: "Saved", message: "Profile information updated", type: "success" });
    } catch (e) {
      notify({ title: "Save failed", message: e?.message || "Failed to save profile", type: "error" });
    }
  };

  const cancelProfile = () => {
    if (profileSnapshot) setProfile({ ...profileSnapshot });
    notify({ title: "Cancelled", message: "Changes were discarded", type: "info" });
  };

  const saveNotifications = async () => {
    try {
      await updateNotificationSettings(notifications);
      notify({ title: "Saved", message: "Notification preferences saved", type: "success" });
    } catch (e) {
      notify({ title: "Save failed", message: e?.message || "Failed to save preferences", type: "error" });
    }
  };

  const saveAppearance = async () => {
    try {
      await updateAppearanceSettings(appearance);
      notify({ title: "Saved", message: "Appearance preferences saved", type: "success" });
    } catch (e) {
      notify({ title: "Save failed", message: e?.message || "Failed to save appearance", type: "error" });
    }
  };

  // Fake upload: convert local file to base64 preview (no backend)
  const onUploadAvatar = async (file) => {
    if (!file) return;

    const okTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!okTypes.includes(file.type)) {
      return notify({ title: "Invalid", message: "Please upload JPG, PNG, GIF or WEBP", type: "error" });
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      return notify({ title: "Too large", message: "Max size is 2MB", type: "error" });
    }

    const base64 = await fileToBase64(file);
    setProfile((p) => ({ ...p, avatar: base64 }));
    notify({ title: "Uploaded", message: "Avatar selected (saved when you press Save)", type: "success" });
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and application preferences" />

      {loading ? <Card>Loading settings…</Card> : null}
      {error ? (
        <Card style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }}>{error}</Card>
      ) : null}

      {!loading && !error ? (
        <Card style={{ padding: 0 }}>
          {/* Tabs */}
          <div style={styles.tabsBar}>
            <TabButton active={activeTab === "account"} onClick={() => setActiveTab("account")}>
              Account
            </TabButton>
            <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
              Profile
            </TabButton>
            <TabButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")}>
              Notifications
            </TabButton>
            <TabButton active={activeTab === "appearance"} onClick={() => setActiveTab("appearance")}>
              Appearance
            </TabButton>
          </div>

          <div style={{ padding: 16 }}>
            {activeTab === "account" ? (
              <AccountTab
                user={user}
                profile={profile}
                setProfile={setProfile}
                passwords={passwords}
                setPasswords={setPasswords}
                onUpdatePassword={updatePassword}
              />
            ) : null}

            {activeTab === "profile" ? (
              <ProfileTab
                profile={profile}
                setProfile={setProfile}
                onUploadAvatar={onUploadAvatar}
                onCancel={cancelProfile}
                onSave={saveProfile}
              />
            ) : null}

            {activeTab === "notifications" ? (
              <NotificationsTab
                notifications={notifications}
                setNotifications={setNotifications}
                onSave={saveNotifications}
              />
            ) : null}

            {activeTab === "appearance" ? (
              <AppearanceTab
                appearance={appearance}
                setAppearance={setAppearance}
                onSave={saveAppearance}
              />
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

// ----------------------
// Tabs
// ----------------------

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.tabBtn,
        ...(active ? styles.tabActive : styles.tabInactive),
      }}
    >
      {children}
    </button>
  );
}

function AccountTab({ user, profile, setProfile, passwords, setPasswords, onUpdatePassword }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={styles.h3}>Account Information</h3>

        <div style={styles.grid2}>
          <Field label="Email">
            <input
              type="email"
              value={user?.email || "user@example.com"}
              readOnly
              style={{ ...styles.input, ...styles.readOnly }}
            />
          </Field>

          <Field label="Full Name">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              style={styles.input}
            />
          </Field>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      <div>
        <h3 style={styles.h3}>Change Password</h3>

        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Current Password">
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              style={styles.input}
            />
          </Field>

          <Field label="New Password">
            <input
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              style={styles.input}
            />
          </Field>

          <Field label="Confirm New Password">
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              style={styles.input}
            />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={onUpdatePassword}>
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, setProfile, onUploadAvatar, onCancel, onSave }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={styles.h3}>Profile Information</h3>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={styles.avatarWrap}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={styles.avatarPlaceholder}>👤</div>
            )}

            <div style={styles.avatarOverlay}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 12 }}>Change</span>
            </div>
          </div>

          <div>
            <label style={{ cursor: "pointer", color: "#2563eb", fontWeight: 900, fontSize: 13 }}>
              Upload new image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onUploadAvatar(e.target.files?.[0])}
                style={{ display: "none" }}
              />
            </label>

            <div style={{ marginTop: 6, color: "#6b7280", fontSize: 12 }}>
              JPG, GIF or PNG. Max size of 2MB
            </div>
          </div>
        </div>

        <div style={styles.grid2}>
          <Field label="Job Title">
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
              style={styles.input}
            />
          </Field>

          <Field label="Department">
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
              style={styles.input}
            />
          </Field>
        </div>

        <div style={{ marginTop: 12 }}>
          <Field label="Bio">
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              style={{ ...styles.input, height: 110, resize: "vertical" }}
            />
          </Field>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}

function NotificationsTab({ notifications, setNotifications, onSave }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={styles.h3}>Notification Preferences</h3>

        <div style={{ display: "grid", gap: 12 }}>
          <CheckRow
            id="email-notifications"
            checked={notifications.email}
            onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
            title="Email Notifications"
            desc="Receive notifications about project updates, tasks and messages via email."
          />
          <CheckRow
            id="push-notifications"
            checked={notifications.push}
            onChange={(v) => setNotifications((p) => ({ ...p, push: v }))}
            title="Push Notifications"
            desc="Receive push notifications in your browser or mobile app."
          />
          <CheckRow
            id="task-reminders"
            checked={notifications.taskReminders}
            onChange={(v) => setNotifications((p) => ({ ...p, taskReminders: v }))}
            title="Task Reminders"
            desc="Get reminded about upcoming task deadlines."
          />
        </div>
      </div>

      <div style={styles.sectionDivider} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" onClick={onSave}>Save Preferences</Button>
      </div>
    </div>
  );
}

function AppearanceTab({ appearance, setAppearance, onSave }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h3 style={styles.h3}>Appearance Settings</h3>

        <div style={{ display: "grid", gap: 14 }}>
          {/* Theme */}
          <div>
            <div style={styles.label}>Theme</div>

            <div style={styles.themeGrid}>
              <ThemeCard
                title="Light"
                preview={<div style={{ ...styles.previewBox, background: "white", border: "1px solid #e5e7eb" }} />}
                selected={appearance.theme === "light"}
                onClick={() => setAppearance((p) => ({ ...p, theme: "light" }))}
              />
              <ThemeCard
                title="Dark"
                preview={<div style={{ ...styles.previewBox, background: "#111827", border: "1px solid #374151" }} />}
                selected={appearance.theme === "dark"}
                onClick={() => setAppearance((p) => ({ ...p, theme: "dark" }))}
              />
              <ThemeCard
                title="System"
                preview={
                  <div
                    style={{
                      ...styles.previewBox,
                      background: "linear-gradient(90deg, #fff 0%, #111827 100%)",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                }
                selected={appearance.theme === "system"}
                onClick={() => setAppearance((p) => ({ ...p, theme: "system" }))}
              />
            </div>
          </div>

          {/* Color scheme */}
          <div>
            <div style={styles.label}>Color Scheme</div>

            <div style={styles.colorGrid}>
              {COLOR_OPTIONS.map((c) => (
                <ColorCard
                  key={c.value}
                  label={c.label}
                  swatch={c.swatch}
                  selected={appearance.colorScheme === c.value}
                  onClick={() => setAppearance((p) => ({ ...p, colorScheme: c.value }))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" onClick={onSave}>Save Preferences</Button>
      </div>
    </div>
  );
}

// ----------------------
// Small UI helpers
// ----------------------

function Field({ label, children }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

function CheckRow({ id, checked, onChange, title, desc }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3 }}
      />
      <div>
        <label htmlFor={id} style={{ fontWeight: 900, color: "#111827", cursor: "pointer" }}>
          {title}
        </label>
        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function ThemeCard({ title, preview, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        ...styles.selectCard,
        ...(selected ? styles.selectedCard : {}),
      }}
    >
      {preview}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 13 }}>{title}</div>
        {selected ? <div style={{ fontWeight: 900 }}>✓</div> : null}
      </div>
    </div>
  );
}

function ColorCard({ label, swatch, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        ...styles.colorCard,
        ...(selected ? styles.selectedCard : {}),
      }}
    >
      <div style={{ height: 28, borderRadius: 10, background: swatch, marginBottom: 8 }} />
      <div style={{ textAlign: "center", fontSize: 12, fontWeight: 900 }}>{label}</div>
    </div>
  );
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ----------------------
// Styles
// ----------------------

const styles = {
  tabsBar: {
    display: "flex",
    gap: 4,
    padding: "0 10px",
    borderBottom: "1px solid #e5e7eb",
  },

  tabBtn: {
    appearance: "none",
    background: "transparent",
    border: "none",
    padding: "12px 12px",
    fontWeight: 900,
    fontSize: 13,
    borderBottom: "2px solid transparent",
    cursor: "pointer",
  },
  tabActive: {
    borderBottomColor: "#2563eb",
    color: "#2563eb",
  },
  tabInactive: {
    color: "#6b7280",
  },

  h3: { margin: 0, fontSize: 16, fontWeight: 950, color: "#111827", marginBottom: 10 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },

  label: { fontSize: 12, color: "#6b7280", fontWeight: 900, marginBottom: 6 },
  input: { width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 10, outline: "none" },
  readOnly: { background: "#f9fafb", color: "#374151" },

  sectionDivider: { borderTop: "1px solid #e5e7eb" },

  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: "hidden",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    position: "relative",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    color: "#6b7280",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 150ms ease",
    pointerEvents: "none",
  },

  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  previewBox: { height: 64, borderRadius: 10 },

  selectCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
  },

  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  colorCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 10,
    cursor: "pointer",
  },

  selectedCard: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.25)",
  },
};

// Make avatar overlay show on hover (simple inline trick)
document.addEventListener?.("mouseover", (e) => {
  const wrap = e.target?.closest?.("[data-avatar-wrap]");
  if (!wrap) return;
});
