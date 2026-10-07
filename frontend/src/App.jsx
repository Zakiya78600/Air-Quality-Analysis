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

function getAQIStatus(aqi) {
  if (aqi <= 50) return { label: "Good", emoji: "🟢" };
  if (aqi <= 100) return { label: "Satisfactory", emoji: "🟡" };
  if (aqi <= 200) return { label: "Moderate", emoji: "🟠" };
  if (aqi <= 300) return { label: "Poor", emoji: "🔴" };
  if (aqi <= 400) return { label: "Very Poor", emoji: "🟣" };
  return { label: "Severe", emoji: "⚫" };
}

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

  const worstCity = cities.length ? cities[0] : null;
  const bestCity = cities.length ? cities[cities.length - 1] : null;

  const highestDay = trend.length
    ? trend.reduce((max, item) => (item.aqi > max.aqi ? item : max), trend[0])
    : null;

  const lowestDay = trend.length
    ? trend.reduce((min, item) => (item.aqi < min.aqi ? item : min), trend[0])
    : null;

  const latestTrend = trend.length ? trend[trend.length - 1] : null;

  const overallStatus = summary
    ? getAQIStatus(summary.avg_aqi)
    : null;

  const latestStatus = latestTrend
    ? getAQIStatus(latestTrend.aqi)
    : null;

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
          Make sure Flask is running on port 5000.
        </div>
      )}

      <main>

        {/* ALERT */}
        {latestTrend && (
          <section className="alert-box">
            <div>
              <strong>
                {latestStatus.emoji} Latest AQI: {latestTrend.aqi}
              </strong>
              <span>
                {" "} — {latestStatus.label} air quality on {latestTrend.date}
              </span>
            </div>
            {latestTrend.aqi > 200 && (
              <div className="alert-message">
                ⚠️ Air pollution is at an unhealthy level.
              </div>
            )}
          </section>
        )}

        {/* STAT CARDS */}
        <section className="stats">

          <StatCard
            title="Average AQI"
            value={summary ? summary.avg_aqi : "--"}
            subtitle={
              overallStatus
                ? `${overallStatus.emoji} ${overallStatus.label}`
                : "Across all records"
            }
          />

          <StatCard
            title="Worst City"
            value={worstCity ? worstCity.city : "--"}
            subtitle={
              worstCity
                ? `${worstCity.avg_aqi} AQI • ${getAQIStatus(worstCity.avg_aqi).label}`
                : ""
            }
          />

          <StatCard
            title="Best City"
            value={bestCity ? bestCity.city : "--"}
            subtitle={
              bestCity
                ? `${bestCity.avg_aqi} AQI • ${getAQIStatus(bestCity.avg_aqi).label}`
                : ""
            }
          />

          <StatCard
            title="Cities Analysed"
            value={summary ? summary.cities : "--"}
            subtitle="Distinct cities"
          />

        </section>

        {/* EXTRA STATS */}
        <section className="stats">

          <StatCard
            title="Highest AQI Day"
            value={highestDay ? highestDay.aqi : "--"}
            subtitle={highestDay ? highestDay.date : ""}
          />

          <StatCard
            title="Lowest AQI Day"
            value={lowestDay ? lowestDay.aqi : "--"}
            subtitle={lowestDay ? lowestDay.date : ""}
          />

          <StatCard
            title="Latest AQI"
            value={latestTrend ? latestTrend.aqi : "--"}
            subtitle={
              latestStatus
                ? `${latestStatus.emoji} ${latestStatus.label}`
                : ""
            }
          />

          <StatCard
            title="Monitoring Period"
            value={trend.length ? trend.length : "--"}
            subtitle="Daily observations"
          />

        </section>

        <section className="grid">

          {/* TREND */}
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
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                    />
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
                <div className="empty">
                  Waiting for Hive trend data...
                </div>
              )}
            </div>
          </div>

          {/* CITY BAR CHART */}
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
                  <BarChart
                    data={cities}
                    layout="vertical"
                    margin={{
                      left: 10,
                      right: 20
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis type="number" />

                    <YAxis
                      dataKey="city"
                      type="category"
                      width={90}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="avg_aqi"
                      name="Average AQI"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty">
                  Waiting for Hive city data...
                </div>
              )}
            </div>
          </div>

          {/* CITY RANKING */}
          <div className="panel">

            <div className="panel-head">
              <div>
                <h2>City AQI Ranking</h2>
                <p>From highest to lowest average AQI</p>
              </div>
            </div>

            <div className="city-table">

              <div className="table-row table-header">
                <span>Rank</span>
                <span>City</span>
                <span>AQI</span>
                <span>Status</span>
              </div>

              {cities.map((city, index) => {
                const status = getAQIStatus(city.avg_aqi);

                return (
                  <div className="table-row" key={city.city}>
                    <span>#{index + 1}</span>

                    <strong>{city.city}</strong>

                    <span>{city.avg_aqi}</span>

                    <span>
                      {status.emoji} {status.label}
                    </span>
                  </div>
                );
              })}

            </div>

          </div>

          {/* INSIGHTS */}
          <div className="panel">

            <div className="panel-head">
              <div>
                <h2>Key Insights</h2>
                <p>Automatically derived from the dataset</p>
              </div>
            </div>

            <div className="insights">

              {worstCity && (
                <div className="insight">
                  🏙️
                  <div>
                    <strong>Most polluted city</strong>
                    <p>
                      {worstCity.city} has the highest average AQI
                      at {worstCity.avg_aqi}.
                    </p>
                  </div>
                </div>
              )}

              {bestCity && (
                <div className="insight">
                  🌿
                  <div>
                    <strong>Cleanest city</strong>
                    <p>
                      {bestCity.city} has the lowest average AQI
                      at {bestCity.avg_aqi}.
                    </p>
                  </div>
                </div>
              )}

              {highestDay && (
                <div className="insight">
                  🚨
                  <div>
                    <strong>Worst recorded day</strong>
                    <p>
                      AQI reached {highestDay.aqi} on {highestDay.date}.
                    </p>
                  </div>
                </div>
              )}

              {lowestDay && (
                <div className="insight">
                  📉
                  <div>
                    <strong>Best recorded day</strong>
                    <p>
                      AQI dropped to {lowestDay.aqi} on {lowestDay.date}.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* AQI GUIDE */}
          <div className="panel">

            <div className="panel-head">
              <div>
                <h2>AQI Health Guide</h2>
                <p>How to interpret the AQI values</p>
              </div>
            </div>

            <div className="aqi-guide">

              <div>
                <span>🟢</span>
                <strong>0–50</strong>
                <small>Good</small>
              </div>

              <div>
                <span>🟡</span>
                <strong>51–100</strong>
                <small>Satisfactory</small>
              </div>

              <div>
                <span>🟠</span>
                <strong>101–200</strong>
                <small>Moderate</small>
              </div>

              <div>
                <span>🔴</span>
                <strong>201–300</strong>
                <small>Poor</small>
              </div>

              <div>
                <span>🟣</span>
                <strong>301–400</strong>
                <small>Very Poor</small>
              </div>

              <div>
                <span>⚫</span>
                <strong>401+</strong>
                <small>Severe</small>
              </div>

            </div>

          </div>

          {/* PIPELINE */}
          <div className="panel">

            <div className="panel-head">
              <div>
                <h2>Data Pipeline</h2>
                <p>How this dashboard works</p>
              </div>
            </div>

            <div className="pipeline">

              <div>
                <b>1</b>
                <span>CSV dataset</span>
              </div>

              <div className="arrow">↓</div>

              <div>
                <b>2</b>
                <span>HDFS storage</span>
              </div>

              <div className="arrow">↓</div>

              <div>
                <b>3</b>
                <span>Hive table</span>
              </div>

              <div className="arrow">↓</div>

              <div>
                <b>4</b>
                <span>HiveQL aggregation</span>
              </div>

              <div className="arrow">↓</div>

              <div>
                <b>5</b>
                <span>Flask API</span>
              </div>

              <div className="arrow">↓</div>

              <div>
                <b>6</b>
                <span>React dashboard</span>
              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer>
          <span>Air Quality Analytics Dashboard</span>
          <span>HDFS → Hive → Flask → React</span>
        </footer>

      </main>
    </div>
  );
}

export default App;

