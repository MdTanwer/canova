import { useState } from "react";

const Settings = () => {
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("Eng");

  return (
    <div className="settings-container">
      <h2 className="settings-title">Preferences</h2>

      <div className="settings-form">
        <div className="settings-field">
          <label className="settings-label">Theme</label>
          <div className="settings-select-wrapper">
            <select
              className="settings-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="Auto">Auto</option>
            </select>
            <div className="settings-select-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Language</label>
          <div className="settings-select-wrapper">
            <select
              className="settings-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="Eng">Eng</option>
              <option value="Esp">Esp</option>
              <option value="Fra">Fra</option>
              <option value="Deu">Deu</option>
            </select>
            <div className="settings-select-arrow">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="#666"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
