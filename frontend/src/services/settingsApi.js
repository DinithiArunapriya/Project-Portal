const KEY = "settings_v1";

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY);
  if (existing) return;

  const seed = {
    profile: {
      name: "John Doe",
      jobTitle: "Software Developer",
      department: "Engineering",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      avatar: null,
    },
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
    },
    appearance: {
      theme: "light", // light | dark | system
      colorScheme: "primary", // primary/indigo/purple/pink/red/orange/green/teal
    },
  };

  localStorage.setItem(KEY, JSON.stringify(seed));
}

function readAll() {
  seedIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export async function getSettings() {
  await new Promise((r) => setTimeout(r, 120));
  return readAll();
}

export async function updateProfileSettings(patch) {
  await new Promise((r) => setTimeout(r, 180));
  const data = readAll();
  const next = {
    ...data,
    profile: { ...data.profile, ...patch },
  };
  writeAll(next);
  return next.profile;
}

export async function updateNotificationSettings(patch) {
  await new Promise((r) => setTimeout(r, 180));
  const data = readAll();
  const next = {
    ...data,
    notifications: { ...data.notifications, ...patch },
  };
  writeAll(next);
  return next.notifications;
}

export async function updateAppearanceSettings(patch) {
  await new Promise((r) => setTimeout(r, 180));
  const data = readAll();
  const next = {
    ...data,
    appearance: { ...data.appearance, ...patch },
  };
  writeAll(next);
  return next.appearance;
}
