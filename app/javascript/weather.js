document.addEventListener("DOMContentLoaded", () => {
  const form           = document.getElementById("weather-form");
  const placeInput     = document.getElementById("place-input");
  const startDateInput = document.getElementById("start-date");
  const endDateInput   = document.getElementById("end-date");
  const resultsEl      = document.getElementById("results");
  const errorEl        = document.getElementById("error");
  const submitBtn      = document.getElementById("submit-btn");

  if (!form) return;

  const today = todayISO();
  if (startDateInput) startDateInput.max = today;
  if (endDateInput)   endDateInput.max   = today;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearUI();

    const place     = (placeInput?.value || "").trim();
    const startDate = startDateInput?.value || "";
    const endDate   = endDateInput?.value || "";

    if (!place) return showError("Please enter a place.");
    if (!startDate || !endDate) return showError("Please select both start and end dates.");

    if (!isPastOrToday(startDate) || !isPastOrToday(endDate)) {
      return showError("Dates must be today or in the past.");
    }

    if (new Date(endDate) < new Date(startDate)) {
      return showError("End date cannot be before start date.");
    }

    if (!isValidDateRange(startDate, endDate)) {
      return showError("The difference between start and end dates must not exceed 15 days.");
    }

    setLoading(true);

    try {
      const url = buildUrl("/temperatures", {
        place,
        start_date: startDate,
        end_date: endDate
      });

      const res = await fetch(url, { headers: { Accept: "application/json" } });

      if (!res.ok) throw new Error(await res.text() || `Request failed with status ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        return showError("No temperature data found for the given range.");
      }

      renderResults(data, place, startDate, endDate);
    } catch (err) {
      showError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  });

  /* ---------- Helpers ---------- */

  function renderResults(arr, place, startDate, endDate) {
    const rows = arr
      .map((item) => `
        <tr>
          <td>${escapeHtml(item.date)}</td>
          <td>${formatNumber(item.max)}</td>
          <td>${formatNumber(item.min)}</td>
        </tr>
      `)
      .join("");

    const heading = `Temperatures for <strong>${escapeHtml(place)}</strong> from ${escapeHtml(startDate)} to ${escapeHtml(endDate)}`;

    resultsEl.innerHTML = `
      <h2>${heading}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Max (°C)</th>
            <th>Min (°C)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    resultsEl.hidden = false;
  }

  function buildUrl(path, params) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") search.append(k, v);
    }
    return `${path}?${search.toString()}`;
  }

  function isPastOrToday(isoDate) {
    const d = new Date(isoDate);
    const t = new Date();
    d.setHours(0,0,0,0);
    t.setHours(0,0,0,0);
    return d <= t;
  }

  function isValidDateRange(start, end) {
    const diff = dateDiffInDays(start, end);
    return diff >= 0 && diff <= 15;
  }

  function dateDiffInDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e - s) / (1000 * 60 * 60 * 24));
  }

  function todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Loading..." : "Get Temperatures";
  }

  function clearUI() {
    errorEl.hidden = true;
    resultsEl.hidden = true;
    resultsEl.innerHTML = "";
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function formatNumber(n) {
    if (n == null || isNaN(Number(n))) return "-";
    return `${Number(n).toFixed(1)} °C`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
