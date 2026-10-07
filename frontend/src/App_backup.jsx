import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const API = "http://localhost:5000";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}

function App() {
  const [cities, setCities] = useState([]);
  const [trend, setTrend] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/aqi/cities`).then(r => r.json()),
      fetch(`${API}/api/aqi/trend`).then(r => r.json()),
      fetch(`${API}/api/aqi/summary`).then(r => r.json())
    ])
      .then(([cityData, trendData, summaryData]) => {
        if (cityData.error || trendData.error || summaryData.error) {
          throw new Error(
            cityData.error || trendData.error || summaryData.error
          );
        }
        setCities(cityData);
        setTrend(trendData);
        setSummary(summaryData);
      })
      .catch(err => setError(err.message));
  }, []);

  const worstCity = cities.length ? cities[0].city : "--";
  const bestCity = cities.length ? cities[cities.length - 1].city : "--";

  return (
    <div className="app">
      <header className="hero">
        <div>
          <div className="eyebrow">BIG DATA • HADOOP • HIVE</div>
          <h1>Air Quality Analytics</h1>
          <p>
            Interactive AQI analysis powered by Hive queries over your
            air-quality dataset.
          </p>
        </div>
        <div className="status">
          <span className="dot"></span>
          Live from Hive
        </div>
      </header>

      {error && (
        <div className="error">
          <strong>Backend connection error:</strong> {error}
          <br />
          Make sure HiveServer2 is running and Flask is running on port 5000.
        </div>
      )}

      <main>
        <section className="stats">
          <StatCard
            title="Average AQI"
            value={summary ? summary.avg_aqi : "--"}
            subtitle="Across all records"
          />
          <StatCard
            title="Worst City"
            value={worstCity}
            subtitle={cities.length ? `${cities[0].avg_aqi} average AQI` : ""}
          />
          <StatCard
            title="Best City"
            value={bestCity}
            subtitle={
              cities.length
                ? `${cities[cities.length - 1].avg_aqi} average AQI`
                : ""
            }
          />
          <StatCard
            title="Cities Analysed"
            value={summary ? summary.cities : "--"}
            subtitle="Distinct cities"
          />
        </section>

        <section className="grid">
          <div className="panel wide">
            <div className="panel-head">
              <div>
                <h2>AQI Trend Over Time</h2>
                <p>Daily average AQI calculated by Hive</p>
              </div>
            </div>
            <div className="chart">
              {trend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="aqi"
                      name="Average AQI"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty">Waiting for Hive trend data...</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Average AQI by City</h2>
                <p>Grouped and averaged in Hive</p>
              </div>
            </div>
            <div className="chart">
              {cities.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cities} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="city" type="category" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="avg_aqi" name="Average AQI" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty">Waiting for Hive city data...</div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Data Pipeline</h2>
                <p>How this dashboard works</p>
              </div>
            </div>
            <div className="pipeline">
              <div><b>1</b><span>CSV dataset</span></div>
              <div className="arrow">↓</div>
              <div><b>2</b><span>HDFS storage</span></div>
              <div className="arrow">↓</div>
              <div><b>3</b><span>Hive table</span></div>
              <div className="arrow">↓</div>
              <div><b>4</b><span>HiveQL aggregation</span></div>
              <div className="arrow">↓</div>
              <div><b>5</b><span>Flask API</span></div>
              <div className="arrow">↓</div>
              <div><b>6</b><span>React dashboard</span></div>
            </div>
          </div>
        </section>

        <footer>
          <span>Air Quality Analytics Dashboard</span>
          <span>HDFS → Hive → Flask → React</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
