import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import "../../styles/home/Dashboard.css";
import { getProjectAnalytics } from "../../api/formBuilderApi";
import "./projectanalysis.css";
interface ProjectAnalyticsData {
  project: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  analytics: {
    totalViews: number;
    totalForms: number;
    publishedForms: number;
    draftForms: number;
    averageViewsPerForm: number;
  };
  forms: Array<{
    id: string;
    title: string;
    views: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    uniqueUrl: string;
  }>;
  topForms: Array<{
    id: string;
    title: string;
    views: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    uniqueUrl: string;
  }>;
  dailyViews: Array<{
    date: string;
    dayName: string;
    views: number;
  }>;
}

const Projectanalysis: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [activeItem, setActiveItem] = useState("home");
  const [projectData, setProjectData] = useState<ProjectAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("This year");

  useEffect(() => {
    const fetchProjectAnalytics = async () => {
      if (!projectId) {
        setError("Project ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getProjectAnalytics(projectId);
        if (response.success) {
          setProjectData(response.data);
        } else {
          setError(response.message || "Failed to fetch project analytics");
        }
      } catch (error) {
        console.error("Failed to fetch project analytics:", error);
        setError("Failed to fetch project analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAnalytics();
  }, [projectId]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleViewAnalysis = (formId: string) => {
    console.log("View analysis for form:", formId);
  };

  const handleMenuClick = (formId: string) => {
    console.log("Menu clicked for form:", formId);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    // Note: In a real implementation, you would refetch data based on timeframe
    // For now, we just update the selected timeframe
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Generate chart data using real daily view data from backend
  const generateChartData = () => {
    if (!projectData || !projectData.dailyViews) {
      return [];
    }

    // Use real daily view data from backend
    const chartData = projectData.dailyViews.map((dayData: { date: string; dayName: string; views: number }) => ({
      name: dayData.dayName,
      value: dayData.views,
      fullName: new Date(dayData.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      }),
      date: dayData.date
    }));
    
    return chartData;
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
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
              style={{
                filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        <main className="main-content">
          <div className="loading-container">
            <div>Loading project analytics...</div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        <main className="main-content">
          <div className="error-container">
            <div>Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  // No project data
  if (!projectData) {
    return (
      <div className="dashboard">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        <main className="main-content">
          <div className="error-container">
            <div>No project data available</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="main-content">
        <header className="header-container">
          <div className="page-header">
            <h1 className="page-title">{projectData.project.name} - Analytics</h1>
          </div>
        </header>
        <div className="content-wrapper">
          {/* Analytics Section */}
          <section className="analytics-section">
            <div className="analytics-header">
              <div className="analytics-controls">
                <div className="chart-tabs">
                  
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
                    <span className="card-label">Total Views</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(projectData.analytics.totalViews)}
                  </div>
                  <div className="card-growth positive">
                    All Forms
                  </div>
                </div>

                

                {/* Average Views Card */}
                <div className="analytics-card">
                  <div className="card-header">
                    <span className="card-label">Avg Views/Form</span>
                  </div>
                  <div className="card-value">
                    {formatNumber(projectData.analytics.averageViewsPerForm)}
                  </div>
                  <div className="card-growth positive">
                    Per Form
                  </div>
                </div>

             
              </div>

              {/* Chart Section */}
              <div className="chart-section">

                <AnalyticsChart data={generateChartData()} />
              </div>
            </div>
          </section>

          {/* Forms List */}
          <section className="projects-section">
            <h2>Forms in this Project</h2>
            {projectData.forms.length === 0 ? (
              <div className="no-forms">
                <p>No forms found in this project.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projectData.forms.map((form) => (
                  <ProjectCard
                    key={form.id}
                    project={{
                      id: form.id,
                      name: form.title,
                      status: form.status,
                      type: "form" as const,
                    
                    }}
                    onViewAnalysis={handleViewAnalysis}
                    onMenuClick={handleMenuClick}
                    setProjectName={() => {}}
                    setProjectId={() => {}}
                  />
                ))}
              </div>
            )}
          </section>

      
        </div>
      </main>
    </div>
  );
};

export default Projectanalysis;
