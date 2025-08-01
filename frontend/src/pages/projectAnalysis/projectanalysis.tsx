import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import "../../styles/home/Dashboard.css";
// import { useNavigate } from "react-router-dom";
import { getAllProjectsSummary } from "../../api/formBuilderApi";

const Projectanalysis: React.FC = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("This year");

  // Dummy analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 7265,
    viewsGrowth: 11.01,
    averageViews: 7265,
    averageGrowth: 11.01,
    chartData: [
      { name: "-7 Day", value: 180, fullName: "7 days ago" },
      { name: "-6 Day", value: 190, fullName: "6 days ago" },
      { name: "-5 Day", value: 170, fullName: "5 days ago" },
      { name: "-4 Day", value: 220, fullName: "4 days ago" },
      { name: "-3 Day", value: 250, fullName: "3 days ago" },
      { name: "-2 Day", value: 240, fullName: "2 days ago" },
      { name: "-1 Day", value: 260, fullName: "Yesterday" },
      { name: "0 Day", value: 280, fullName: "Today" },
    ],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = (await getAllProjectsSummary()) as {
          data: ProjectSummary[];
        };
        setProjects(response.data || []);
      } catch (error) {
        console.error("Failed to fetch projects summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  interface ProjectSummary {
    id: string;
    name: string;
    type?: string;
    status?: string;
    forms?: { id: string; name: string }[];
    isShared: boolean;
  }

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleViewAnalysis = (projectId: string) => {
    console.log("View analysis for project:", projectId);
  };

  const handleMenuClick = (projectId: string) => {
    console.log("Menu clicked for project:", projectId);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    // Update analytics data based on timeframe
    if (timeframe === "Last year") {
      setAnalyticsData({
        ...analyticsData,
        totalViews: 6420,
        viewsGrowth: 8.5,
        averageViews: 6420,
        averageGrowth: 8.5,
      });
    } else {
      setAnalyticsData({
        ...analyticsData,
        totalViews: 7265,
        viewsGrowth: 11.01,
        averageViews: 7265,
        averageGrowth: 11.01,
      });
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Recharts Line Chart component
  const AnalyticsChart = ({
    data,
  }: {
    data: Array<{ name: string; value: number; fullName: string }>;
  }) => {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            {/* Remove grid lines for cleaner look */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              interval={0}
            />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              style={{
                filter: "none",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="main-content">
        <header className="header-container">
          <div className="page-header">
            <h1 className="page-title">Welcome to CANOVA</h1>
          </div>
        </header>
        <div className="content-wrapper">
          {/* Analytics Section */}
          <section className="analytics-section">
            <div className="analytics-header">
              <div className="analytics-controls">
                <div className="chart-tabs">
                  <span className="tab active">Average Response Chart</span>
                  <span className="tab">Total Page</span>
                  <span className="tab">Operating Status</span>
                </div>
                <div className="timeframe-selector">
                  <button
                    className={`timeframe-btn ${
                      selectedTimeframe === "This year" ? "active" : ""
                    }`}
                    onClick={() => handleTimeframeChange("This year")}
                  >
                    • This year
                  </button>
                  <button
                    className={`timeframe-btn ${
                      selectedTimeframe === "Last year" ? "active" : ""
                    }`}
                    onClick={() => handleTimeframeChange("Last year")}
                  >
                    • Last year
                  </button>
                </div>
              </div>
            </div>

            <div className="analytics-content">
              <div className="analytics-cards">
                {/* Total Views Card */}
                <div className="analytics-card">
                  <div className="card-header">
                    <span className="card-label">Views</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(analyticsData.totalViews)}
                  </div>
                  <div className="card-growth positive">
                    +{analyticsData.viewsGrowth}% ↗
                  </div>
                </div>

                {/* Average Views Card */}
                <div className="analytics-card">
                  <div className="card-header">
                    <span className="card-label">Views</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(analyticsData.averageViews)}
                  </div>
                  <div className="card-growth positive">
                    +{analyticsData.averageGrowth}% ↗
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-section">
                <AnalyticsChart data={analyticsData.chartData} />
              </div>
            </div>
          </section>

          {/* Projects from API */}
          <section className="projects-section">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="projects-grid">
                {projects
                  .filter((project) => project.type === "form")
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        name: project.name,
                        status: project.status,
                        type: (project.type as "form" | "project") || "project",
                      }}
                      onViewAnalysis={handleViewAnalysis}
                      onMenuClick={handleMenuClick}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <style jsx>{`
        .analytics-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .analytics-header {
          margin-bottom: 24px;
        }

        .analytics-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-tabs {
          display: flex;
          gap: 24px;
        }

        .tab {
          color: #6b7280;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 0;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab.active {
          color: #1f2937;
          border-bottom-color: #3b82f6;
        }

        .timeframe-selector {
          display: flex;
          gap: 16px;
        }

        .timeframe-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .timeframe-btn.active {
          color: #1f2937;
          background: #f3f4f6;
        }

        .analytics-content {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }

        .analytics-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 200px;
        }

        .analytics-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .card-header {
          margin-bottom: 8px;
        }

        .card-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .card-value {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .card-growth {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-growth.positive {
          color: #059669;
        }

        .chart-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .chart-container {
          position: relative;
          width: 100%;
          min-height: 200px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e9ecef;
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding: 0 10px;
        }

        .chart-label {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .analytics-content {
            flex-direction: column;
            gap: 24px;
          }

          .analytics-cards {
            flex-direction: row;
            min-width: auto;
          }

          .analytics-controls {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Projectanalysis;
