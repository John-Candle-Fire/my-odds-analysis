// src/components/dailyHighlightsDisplay.jsx

import React from "react";
import "../styles/main.css";

const DailyHighlightsDisplay = ({ dailyHighlights }) => {
  if (!dailyHighlights) {
    return (
      <div className="findings-display">
        <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
          No daily highlights available for this date.
        </p>
      </div>
    );
  }

  const { metadata, meeting_context, details } = dailyHighlights;

  // Convert race_volatility object { "1": "CHAOS", ... } to array
  const raceVolatilityArray = details?.race_volatility
    ? Object.entries(details.race_volatility).map(([race, volatility]) => ({
        race_number: Number(race),
        volatility,
      }))
    : [];

  const renderTable = (title, columns, rows, rowKeyFn) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }
    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>{title}</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="compact-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={rowKeyFn ? rowKeyFn(row, idx) : idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {row[col.key] !== undefined && row[col.key] !== null
                        ? String(row[col.key])
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="findings-display">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
          borderBottom: "2px solid var(--primary)",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>📌</span>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Daily Highlights</h3>
      </div>

      {/* Metadata */}
      <div
        style={{
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "1rem",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Metadata</h4>
        <div style={{ fontSize: "0.9rem", color: "#555" }}>
          <div>
            <strong>Date:</strong>{" "}
            {metadata?.date ? String(metadata.date) : "N/A"}
          </div>
          <div>
            <strong>Generated at:</strong>{" "}
            {metadata?.generated_at ? String(metadata.generated_at) : "N/A"}
          </div>
          <div>
            <strong>Meeting volatility:</strong>{" "}
            {meeting_context?.volatility
              ? String(meeting_context.volatility)
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Per-race details */}
      <div
        style={{
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Per-Race Details</h4>

        {renderTable(
          "Stable Attack Stats",
          [
            { key: "trainer", label: "Trainer" },
            { key: "strong_chances_count", label: "Strong Chances" },
            { key: "tier", label: "Tier" },
          ],
          details?.stable_attack_stats,
          (row, idx) => `${row.trainer || "trainer"}-${idx}`
        )}

        {renderTable(
          "Jockey Attack Stats",
          [
            { key: "jockey", label: "Jockey" },
            { key: "strong_chances_count", label: "Strong Chances" },
            { key: "tier", label: "Tier" },
          ],
          details?.jockey_attack_stats,
          (row, idx) => `${row.jockey || "jockey"}-${idx}`
        )}

        {renderTable(
          "Race Volatility",
          [
            { key: "race_number", label: "Race" },
            { key: "volatility", label: "Volatility" },
          ],
          raceVolatilityArray,
          (row, idx) => `rv-${row.race_number || idx}`
        )}

        {renderTable(
          "Traffic Risks",
          [
            { key: "race_number", label: "Race" },
            { key: "bias", label: "Bias" },
            { key: "field_size", label: "Field Size" },
          ],
          details?.traffic_risks,
          (row, idx) => `tr-${row.race_number || idx}`
        )}

        {renderTable(
          "Scenario A – Late Steamers",
          [
            { key: "race_number", label: "Race" },
            { key: "late_steamer", label: "Horse" },
            { key: "late_steamer_name", label: "Horse Name" },
          ],
          details?.scenario_A_late_steamers,
          (row, idx) => `lsa-${row.race_number || idx}`
        )}

        {renderTable(
          "Scenario B – Early Favorites",
          [
            { key: "race_number", label: "Race" },
            { key: "early_favorite", label: "Horse" },
            { key: "early_favorite_name", label: "Horse Name" },
          ],
          details?.scenario_B_early_favorites,
          (row, idx) => `ef-${row.race_number || idx}`
        )}

        {renderTable(
          "Jockey Upgrades",
          [
            { key: "race", label: "Race" },
            { key: "horse", label: "Horse" },
            { key: "switch", label: "Upgrade" },
          ],
          details?.jockey_upgrades,
          (row, idx) => `ju-${row.race || idx}`
        )}
      </div>
    </div>
  );
};

export default DailyHighlightsDisplay;
