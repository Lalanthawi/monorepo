// components/manager/DateRangeSelector.jsx
import React from "react";

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const presets = [
    {
      label: "Today",
      action: () => {
        onStartDateChange(today);
        onEndDateChange(today);
      },
    },
    {
      label: "This Week",
      action: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);

        onStartDateChange(startOfWeek.toISOString().split("T")[0]);
        onEndDateChange(today);
      },
    },
    {
      label: "This Month",
      action: () => {
        onStartDateChange(firstDayOfMonth);
        onEndDateChange(today);
      },
    },
    {
      label: "Last 30 Days",
      action: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        onStartDateChange(thirtyDaysAgo.toISOString().split("T")[0]);
        onEndDateChange(today);
      },
    },
  ];

  return (
    <div className="date-range-selector">
      <h4>Select Date Range</h4>

      <div className="date-inputs">
        <div className="date-input-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={today}
          />
        </div>

        <div className="date-input-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
            max={today}
          />
        </div>
      </div>

      <div className="date-presets">
        {presets.map((preset, index) => (
          <button key={index} className="preset-btn" onClick={preset.action}>
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeSelector;
