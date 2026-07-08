import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  FEEDBACK_UPDATED_EVENT,
  getAverageRatings,
  getFeedbackData,
  getServiceCounts,
  SERVICE_CATEGORIES,
} from "@/utils/feedback";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CATEGORY_COLOR_MAP = {
  Traffic: "#2563eb",
  Business: "#4f46e5",
  Report: "#0ea5e9",
  Banking: "#14b8a6",
  Document: "#f59e0b",
  Healthcare: "#22c55e",
  "Wills & Estate": "#ec4899",
};

function getCategoryColors() {
  return SERVICE_CATEGORIES.map((service) => CATEGORY_COLOR_MAP[service] || "#64748b");
}

export default function CitizenInsightsDashboard() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    const loadData = () => {
      setFeedbackData(getFeedbackData());
    };

    loadData();
    window.addEventListener("storage", loadData);
    window.addEventListener(FEEDBACK_UPDATED_EVENT, loadData);
    window.addEventListener("focus", loadData);
    document.addEventListener("visibilitychange", loadData);
    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener(FEEDBACK_UPDATED_EVENT, loadData);
      window.removeEventListener("focus", loadData);
      document.removeEventListener("visibilitychange", loadData);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  const serviceCounts = useMemo(() => getServiceCounts(feedbackData), [feedbackData]);
  const averageRatings = useMemo(() => getAverageRatings(feedbackData), [feedbackData]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAiSummary = async () => {
      if (feedbackData.length === 0) {
        setAiSummary("");
        setSummaryError("");
        return;
      }

      setIsGeneratingSummary(true);
      setSummaryError("");

      try {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalFeedback: feedbackData.length,
            serviceCounts,
            averageRatings,
            feedbackSamples: feedbackData.slice(-10),
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!controller.signal.aborted) {
          setAiSummary(data.summary || "");
          setSummaryError(data.error ? "AI summary generated with fallback data." : "");
        }
      } catch {
        if (!controller.signal.aborted) {
          setSummaryError("Unable to generate AI summary right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsGeneratingSummary(false);
        }
      }
    };

    loadAiSummary();

    return () => controller.abort();
  }, [feedbackData, serviceCounts, averageRatings]);

  const pieData = useMemo(
    () => ({
      labels: SERVICE_CATEGORIES,
      datasets: [
        {
          label: "Service Demand",
          data: SERVICE_CATEGORIES.map((service) => serviceCounts[service] || 0),
          backgroundColor: getCategoryColors(),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }),
    [serviceCounts]
  );

  const barData = useMemo(
    () => ({
      labels: SERVICE_CATEGORIES,
      datasets: [
        {
          label: "Average Satisfaction",
          data: SERVICE_CATEGORIES.map((service) => averageRatings[service] || 0),
          backgroundColor: getCategoryColors(),
          borderColor: getCategoryColors(),
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: isMobile ? 30 : 56,
        },
      ],
    }),
    [averageRatings, isMobile]
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 3,
          ticks: {
            stepSize: 1,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            color: "rgba(148, 163, 184, 0.2)",
          },
        },
        x: {
          ticks: {
            maxRotation: isMobile ? 35 : 0,
            minRotation: isMobile ? 35 : 0,
            autoSkip: false,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    }),
    [isMobile]
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: isMobile ? 10 : 14,
            padding: isMobile ? 10 : 14,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    }),
    [isMobile]
  );

  return (
    <section className="insights-dashboard" aria-label="Citizen Insights Dashboard">
      <div className="insights-header">
        <span className="insights-badge">ANALYTICS</span>
        <h2>Citizen Insights Dashboard</h2>
        <p>
          AI-powered government assistant with citizen feedback analytics.
        </p>
      </div>

      <article className="insights-ai-card">
        <div className="insights-ai-head">
          <h3>AI Insights</h3>
          {isGeneratingSummary && <span className="insights-ai-status">Generating...</span>}
        </div>
        <p className="insights-ai-copy">
          {aiSummary || "The AI summary will appear here once feedback is available."}
        </p>
        {summaryError && <p className="insights-ai-error">{summaryError}</p>}
      </article>

      <div className="insights-grid">
        <article className="insights-card">
          <h3>Service Demand</h3>
          <p className="insights-note">Based on submitted feedback count per service.</p>
          <div className="chart-wrap">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </article>

        <article className="insights-card">
          <h3>Satisfaction Analysis</h3>
          <p className="insights-note">Average score: Satisfied=3, Neutral=2, Dissatisfied=1.</p>
          <div className="chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </article>
      </div>

      {feedbackData.length === 0 && (
        <p className="insights-empty">No feedback yet. Submit feedback from chat to see live insights.</p>
      )}

      <style jsx>{`
        .insights-dashboard {
          margin-top: 2.5rem;
          padding: 2rem;
          border: 1px solid #e5e7eb;
          border-radius: 1.5rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.07);
        }

        .insights-header h2 {
          margin: 0.35rem 0;
          font-size: 1.9rem;
        }

        .insights-header p {
          margin: 0;
          color: #4b5563;
        }

        .insights-badge {
          display: inline-flex;
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .insights-grid {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .insights-ai-card {
          margin-top: 1rem;
          padding: 1rem 1.1rem;
          border: 1px solid #dbeafe;
          border-radius: 1rem;
          background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
        }

        .insights-ai-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }

        .insights-ai-head h3 {
          margin: 0;
          font-size: 1rem;
        }

        .insights-ai-status {
          font-size: 0.78rem;
          font-weight: 700;
          color: #2563eb;
          background: rgba(37, 99, 235, 0.12);
          padding: 0.3rem 0.55rem;
          border-radius: 999px;
        }

        .insights-ai-copy {
          margin: 0;
          color: #1f2937;
          line-height: 1.7;
          white-space: pre-line;
        }

        .insights-ai-error {
          margin: 0.6rem 0 0;
          color: #6b7280;
          font-size: 0.88rem;
        }

        .insights-card {
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          padding: 1rem;
          background: #ffffff;
        }

        .insights-card h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .insights-note {
          margin: 0.45rem 0 0.8rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .chart-wrap {
          position: relative;
          width: 100%;
          height: clamp(220px, 36vw, 300px);
        }

        .chart-wrap :global(canvas) {
          width: 100% !important;
          height: 100% !important;
        }

        .insights-empty {
          margin: 1rem 0 0;
          color: #6b7280;
          font-size: 0.92rem;
        }

        @media (max-width: 900px) {
          .insights-ai-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .chart-wrap {
            height: clamp(200px, 52vw, 260px);
          }

          .insights-dashboard {
            padding: 1.25rem;
          }

          .insights-header h2 {
            font-size: 1.45rem;
          }

          .insights-note {
            font-size: 0.82rem;
          }
        }
      `}</style>
    </section>
  );
}
