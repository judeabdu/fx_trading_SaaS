import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function BillingPage() {
  // Mock function to trigger the report download
  const handleDownloadReport = () => {
    // In a real scenario, this would call your API to generate the PDF/CSV
    alert("Generating your financial discipline report...");
    
    // Example: Triggering a download for a hypothetical file
    const link = document.createElement("a");
    link.href = "/path-to-your-report.pdf"; // Replace with your actual report route/file
    link.download = "Financial_Discipline_Report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div style={containerStyle}>
        <div style={headerRow}>
          <div>
            <h1 style={titleStyle}>Billing & Subscription</h1>
            <p style={subStyle}>Manage your platform subscription</p>
          </div>
          <div style={badgeStyle}>PREMIUM PLAN</div>
        </div>

        <div style={planCard}>
          <h2 style={planTitle}>Institutional Trader</h2>
          <h1 style={priceStyle}>
            $99<span style={monthStyle}>/month</span>
          </h1>
          <ul style={featureList}>
            <li>✔ Unlimited Trading Accounts</li>
            <li>✔ AI Analytics Engine</li>
            <li>✔ Live Trade Monitoring</li>
            <li>✔ Institutional Risk Metrics</li>
            <li>✔ Priority Cloud Execution</li>
          </ul>

          <button style={buttonStyle} onClick={handleDownloadReport}>
            Download Discipline Report
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Styles remain as you defined, just ensuring consistency
const containerStyle = { color: "white" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const titleStyle = { fontSize: "32px" };
const subStyle = { color: "#64748b" };
const badgeStyle = { background: "rgba(251,191,36,0.1)", border: "1px solid #fbbf24", color: "#fbbf24", padding: "10px 18px", borderRadius: "30px", fontWeight: "700", fontSize: "12px" };
const planCard = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "20px", padding: "40px", maxWidth: "500px" };
const planTitle = { marginBottom: "20px" };
const priceStyle = { fontSize: "52px", marginBottom: "30px" };
const monthStyle = { fontSize: "20px", color: "#64748b" };
const featureList = { lineHeight: "2.2", color: "#cbd5e1", marginBottom: "30px", listStyle: "none", padding: 0 };
const buttonStyle = { background: "#fbbf24", border: "none", padding: "16px 24px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", width: "100%" };

export default BillingPage;