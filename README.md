# Air Quality Analytics Dashboard

This project adds a React + Flask frontend/backend layer on top of an existing Hadoop/HDFS/Hive air-quality project.

## Architecture

CSV dataset → HDFS → Hive (`airquality_db.air_quality`) → HiveQL → Flask API → React dashboard

## Existing Hive requirements

HiveServer2 must be running on:

`localhost:10000`

Database:

`airquality_db`

Table:

`air_quality`

Expected columns:

- record_id
- log_date
- city
- pm25
- pm10
- no2
- so2
- co
- aqi
- aqi_bucket

## 1. Start HiveServer2

Use the HiveServer2 command that already works on your Ubuntu/WSL setup.

Verify:

```bash
ss -ltnp | grep 10000
```

## 2. Start Flask backend

```bash
cd ~/airquality_dashboard/backend
python3 -m pip install --user -r requirements.txt
python3 app.py
```

If Ubuntu blocks `--user`, use your existing Python environment or:

```bash
sudo apt install python3-flask python3-flask-cors -y
python3 app.py
```

Test in a browser:

`http://localhost:5000`

and:

`http://localhost:5000/api/aqi/cities`

## 3. Start React frontend

Open a second Ubuntu/WSL terminal:

```bash
cd ~/airquality_dashboard/frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

`http://localhost:5173`

## Important

Do not put the CSV directly into React. The dashboard intentionally requests aggregated data from Flask, and Flask runs HiveQL through Beeline. This keeps Hadoop/HDFS/Hive as the data-processing layer.

## Troubleshooting

### Backend says Hive connection failed

Make sure HiveServer2 is listening on port 10000:

```bash
ss -ltnp | grep 10000
```

Test Beeline:

```bash
beeline -u 'jdbc:hive2://localhost:10000/airquality_db'
```

Then:

```sql
SELECT COUNT(*) FROM air_quality;
```

### Frontend says Backend connection error

Make sure Flask is running on port 5000:

```bash
curl http://localhost:5000/
```

Then:

```bash
curl http://localhost:5000/api/aqi/cities
```

### CORS error

The backend already enables Flask-CORS. If the module is missing:

```bash
sudo apt install python3-flask-cors -y
```

## Dashboard features

- Average AQI summary
- Worst city
- Best city
- Number of cities
- AQI trend over time
- Average AQI by city
- Visible Hadoop → HDFS → Hive → Flask → React pipeline
# Air-Quality-Analysis
