import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

function formatMonth({ year, month }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.user_type !== "Admin") return;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("/bookings/analytics");
        setData(response.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!user || user.user_type !== "Admin") {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: "2rem" }}>
        <h2 style={{ color: "#d32f2f" }}>Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Loading Analytics...</h2>
        <p>Please wait while we fetch your data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: "2rem" }}>
        <h2 style={{ color: "#d32f2f" }}>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#232946",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: "2rem" }}>
        <h2>No Data Available</h2>
        <p>There is no analytics data to display at this time.</p>
      </div>
    );
  }

  // Prepare chart data
  const months = data?.monthlyTrend?.map((m) => formatMonth(m._id)) || [];
  const sales = data?.monthlyTrend?.map((m) => m.total) || [];
  const bookings = data?.monthlyTrend?.map((m) => m.count) || [];
  const destLabels = data?.topDestinations?.map((d) => d._id || "Unknown") || [];
  const destCounts = data?.topDestinations?.map((d) => d.count) || [];
  const destRevenue = data?.topDestinations?.map((d) => d.revenue) || [];
  const typeLabels = ["Tour", "Hotel", "Flight", "Custom"];
  const typeCounts = [data?.bookingsByType?.tour, data?.bookingsByType?.hotel, data?.bookingsByType?.flight, data?.bookingsByType?.custom];
  const peakMonths = data?.peakMonths?.map((m) => m._id.month) || [];
  const tierLabels = data?.bookingsByTier?.map((t) => t._id || "Unknown") || [];
  const tierCounts = data?.bookingsByTier?.map((t) => t.count) || [];
  const dayOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bookingsByDay = Array(7).fill(0);
  if (data?.bookingsByDayOfWeek) {
    data.bookingsByDayOfWeek.forEach((d) => {
      bookingsByDay[(d._id - 1) % 7] = d.count;
    });
  }

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["Month", "Sales", "Bookings"],
      ...data.monthlyTrend.map((m) => [formatMonth(m._id), m.total, m.count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF (single long page, all analytics content)
  const exportPDF = async () => {
    const input = document.getElementById("analytics-export");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // Set PDF size to match the full dashboard (one long page)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height + 70] // 70px for title/date
    });

    // Add title and date at the top
    pdf.setFontSize(24);
    pdf.text("Travel Agency Analytics Report", 30, 40);
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 30, 60);

    // Add the dashboard image below the title
    pdf.addImage(imgData, "PNG", 0, 70, canvas.width, canvas.height);

    pdf.save("analytics_report.pdf");
  };

  return (
    <div className="dashboard-card" style={{ maxWidth: 1200 }}>
      <div id="analytics-export">
        <h2 style={{ fontWeight: 700, fontSize: "1.6rem", color: "#232946", marginBottom: 12 }}>Analytics & Reports</h2>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#393e6c" }}>Total Sales</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#2e7d32" }}>${data.totalSales?.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#393e6c" }}>Total Bookings</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1565c0" }}>{data.totalBookings}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#393e6c" }}>Active Users (30d)</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#f9a825" }}>{data.activeUsers}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#393e6c" }}>Cancellation Rate</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#d32f2f" }}>{data.cancellationRate?.toFixed(2)}%</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 2, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Monthly Sales Trend</div>
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Sales ($)",
                    data: sales,
                    borderColor: "#232946",
                    backgroundColor: "rgba(35,41,70,0.08)",
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: "Bookings",
                    data: bookings,
                    borderColor: "#eebbc3",
                    backgroundColor: "rgba(238,187,195,0.15)",
                    tension: 0.3,
                    fill: true,
                    yAxisID: "y1",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
                scales: { y: { beginAtZero: true }, y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false } } },
              }}
              height={220}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Bookings by Type</div>
            <Pie
              data={{
                labels: typeLabels,
                datasets: [
                  {
                    data: typeCounts,
                    backgroundColor: ["#232946", "#eebbc3", "#f9a825", "#1565c0"],
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
              height={220}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Top Destinations (Revenue)</div>
            <Bar
              data={{
                labels: destLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: destCounts,
                    backgroundColor: "#232946",
                  },
                  {
                    label: "Revenue ($)",
                    data: destRevenue,
                    backgroundColor: "#f9a825",
                  },
                ],
              }}
              options={{ indexAxis: "y", plugins: { legend: { position: "bottom" } } }}
              height={180}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Peak Travel Months</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {peakMonths.map((m, i) => (
                <li key={i} style={{ fontSize: 18, fontWeight: 600, color: "#232946", marginBottom: 6 }}>
                  {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Bookings by Membership Tier</div>
            <Bar
              data={{
                labels: tierLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: tierCounts,
                    backgroundColor: ["#232946", "#eebbc3", "#f9a825"],
                  },
                ],
              }}
              options={{ plugins: { legend: { display: false } } }}
              height={180}
            />
          </div>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Bookings by Day of Week</div>
            <Bar
              data={{
                labels: dayOfWeekLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: bookingsByDay,
                    backgroundColor: "#eebbc3",
                  },
                ],
              }}
              options={{ plugins: { legend: { display: false } } }}
              height={180}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Average Booking Value</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#232946" }}>${data.avgBookingValue?.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Average Lead Time (days)</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#232946" }}>{data.avgLeadTime?.toFixed(1)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Refund Rate</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#d32f2f" }}>{data.refundRate?.toFixed(2)}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Total Refunded</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#d32f2f" }}>${data.totalRefundAmount?.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Average Rating</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f9a825" }}>{data.avgRating?.toFixed(2)} / 5</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Review Count</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#232946" }}>{data.reviewCount}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Hotel Occupancy Rate</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#232946" }}>{data.occupancyRate?.toFixed(2)}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Flight Seat Utilization</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#232946" }}>{data.seatUtilization?.toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button onClick={exportCSV} style={{ background: "#232946", color: "#fff", border: 0, borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 600, cursor: "pointer" }}>Export CSV</button>
        <button onClick={exportPDF} style={{ background: "#eebbc3", color: "#232946", border: 0, borderRadius: 6, padding: "0.6rem 1.2rem", fontWeight: 600, cursor: "pointer" }}>Export PDF</button>
      </div>
    </div>
  );
} 