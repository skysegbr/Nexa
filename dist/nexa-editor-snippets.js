// Nexa Editor Snippets — converted from pipeline-runner/boilerplates.js

// ── Boilerplates ──────────────────────────────────────────────────────────

const BOILERPLATES = {
  read_input: `import os

input_data = os.environ.get("PIPELINE_INPUT", "")
print(f"Input received: {input_data}")
`,
  print_output: `result = "Hello, Pipeline!"
print(result)
`,
  json_input: `import os, json

input_data = os.environ.get("PIPELINE_INPUT", "{}")
data = json.loads(input_data)
print(json.dumps(data, indent=2, ensure_ascii=False))
`,
  pipeline_files: `import os
from pathlib import Path

# PIPELINE_FILES is a PERSISTENT directory between executions.
# Ideal for automation: step 1 saves data, step 2 reads it.
# Files are also visible in the 📁 Files panel.
FILES = Path(os.environ.get("PIPELINE_FILES", "."))

# ── Automation example: fetch data and save ──
import urllib.request, json

url = "https://httpbin.org/get"
with urllib.request.urlopen(url) as resp:
    data = json.loads(resp.read())

output = FILES / "result.json"
output.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"✅ Saved: {output.name} ({output.stat().st_size} bytes)")

# ── List available files ──
for f in sorted(FILES.iterdir()):
    if f.is_file():
        print(f"  📄 {f.name} ({f.stat().st_size:,} bytes)")
`,
  read_file: `import os
from pathlib import Path

FILES = Path(os.environ.get("PIPELINE_FILES", "."))

file = FILES / "file.txt"
if file.exists():
    content = file.read_text(encoding="utf-8")
    print(content)
else:
    print(f"File not found: {file}")
    print("Available files:", [f.name for f in FILES.iterdir() if f.is_file()])
`,
  write_file: `import os
from pathlib import Path

FILES = Path(os.environ.get("PIPELINE_FILES", "."))

data = "Content to save"
(FILES / "output.txt").write_text(data, encoding="utf-8")
print("✅ File saved at PIPELINE_FILES/output.txt")
`,
  csv_read: `import os
from pathlib import Path
import pandas as pd

FILES = Path(os.environ.get("PIPELINE_FILES", "."))

df = pd.read_csv(FILES / "data.csv")
print(df.head())
print(f"\\n{len(df)} rows, {len(df.columns)} columns")
`,
  http_get: `import requests

resp = requests.get("https://httpbin.org/get")
resp.raise_for_status()
print(resp.json())
`,
  http_post: `import requests, json

payload = {"key": "value"}
resp = requests.post("https://httpbin.org/post", json=payload)
resp.raise_for_status()
print(json.dumps(resp.json(), indent=2))
`,
  sqlite_query: `import os
from pathlib import Path
import sqlite3

FILES = Path(os.environ.get("PIPELINE_FILES", "."))

conn = sqlite3.connect(FILES / "database.db")
cur = conn.execute("SELECT * FROM table_name LIMIT 10")
for row in cur.fetchall():
    print(row)
conn.close()
`,
  postgres_query: `import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="mydb",
    user="user",
    password="password"
)
cur = conn.cursor()
cur.execute("SELECT * FROM table_name LIMIT 10")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
`,
  mysql_query: `import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    port=3306,
    database="mydb",
    user="user",
    password="password"
)
cur = conn.cursor()
cur.execute("SELECT * FROM table_name LIMIT 10")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
`,
  sqlserver_query: `import pyodbc

conn = pyodbc.connect(
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=localhost,1433;"
    "DATABASE=mydb;"
    "UID=user;"
    "PWD=password;"
    "TrustServerCertificate=yes"
)
cur = conn.cursor()
cur.execute("SELECT TOP 10 * FROM table_name")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
`,
  oracle_query: `import oracledb

conn = oracledb.connect(
    user="user",
    password="password",
    dsn="localhost:1521/XEPDB1"
)
cur = conn.cursor()
cur.execute("SELECT * FROM table_name WHERE ROWNUM <= 10")
for row in cur.fetchall():
    print(row)
cur.close()
conn.close()
`,
  mongo_query: `from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
collection = db["collection"]

for doc in collection.find().limit(10):
    print(doc)

client.close()
`,
  redis_get: `import redis

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# Set
r.set("key", "value")

# Get
value = r.get("key")
print(f"key = {value}")
`,
  sqlalchemy_query: `from sqlalchemy import create_engine, text

# Replace the URL with your database:
# PostgreSQL: postgresql://user:pass@host:5432/db
# MySQL:      mysql+mysqlconnector://user:pass@host:3306/db
# SQLite:     sqlite:///database.db
engine = create_engine("sqlite:///database.db")

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM table_name LIMIT 10"))
    for row in result:
        print(row)
`,
  try_except: `try:
    # Your code here
    result = 42
    print(f"Result: {result}")
except Exception as e:
    print(f"Error: {e}")
`,
  subprocess_run: `import subprocess

result = subprocess.run(
    ["echo", "Hello from shell"],
    capture_output=True, text=True, check=True
)
print(result.stdout)
`,
  timer: `import time

start = time.perf_counter()

# Your code here
time.sleep(0.5)

duration = time.perf_counter() - start
print(f"Time: {duration:.3f}s")
`,
  reportlab_pdf: `from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=A4)
styles = getSampleStyleSheet()
elements = []

# Title
elements.append(Paragraph("Sample Report", styles["Title"]))
elements.append(Spacer(1, 0.5 * cm))

# Table
data = [
    ["Name", "Value", "Status"],
    ["Item A", "100", "OK"],
    ["Item B", "200", "Pending"],
    ["Item C", "150", "OK"],
]
table = Table(data, colWidths=[6 * cm, 4 * cm, 4 * cm])
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4a90d9")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
]))
elements.append(table)

doc.build(elements)
print("report.pdf generated successfully!")
`,
  fpdf2_pdf: `from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

# Title
pdf.set_font("Helvetica", "B", 16)
pdf.cell(0, 10, "Sample Report", new_x="LMARGIN", new_y="NEXT", align="C")
pdf.ln(5)

# Table
pdf.set_font("Helvetica", "B", 10)
columns = ["Name", "Value", "Status"]
widths = [70, 50, 50]
for col, w in zip(columns, widths):
    pdf.cell(w, 8, col, border=1, align="C")
pdf.ln()

pdf.set_font("Helvetica", "", 10)
rows = [
    ["Item A", "100", "OK"],
    ["Item B", "200", "Pending"],
    ["Item C", "150", "OK"],
]
for row in rows:
    for val, w in zip(row, widths):
        pdf.cell(w, 8, val, border=1, align="C")
    pdf.ln()

pdf.output("report.pdf")
print("report.pdf generated successfully!")
`,
  weasyprint_pdf: `from weasyprint import HTML

html_content = '''
<!DOCTYPE html><html><head><style>
  body { font-family: Arial, sans-serif; margin: 40px; }
  h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { background: #3498db; color: white; padding: 10px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) { background: #f8f9fa; }
  .footer { margin-top: 30px; color: #888; font-size: 12px; }
</style></head><body>
  <h1>Sample Report</h1>
  <table>
    <tr><th>Name</th><th>Value</th><th>Status</th></tr>
    <tr><td>Item A</td><td>100</td><td>OK</td></tr>
    <tr><td>Item B</td><td>200</td><td>Pending</td></tr>
    <tr><td>Item C</td><td>150</td><td>OK</td></tr>
  </table>
  <p class="footer">Automatically generated</p>
</body></html>
'''

HTML(string=html_content).write_pdf("report.pdf")
print("report.pdf generated successfully!")
`,
  openpyxl_excel: `from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

wb = Workbook()
ws = wb.active
ws.title = "Report"

# Styles
header_font = Font(bold=True, color="FFFFFF", size=11)
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
center = Alignment(horizontal="center", vertical="center")
border = Border(
    left=Side(style="thin"), right=Side(style="thin"),
    top=Side(style="thin"),  bottom=Side(style="thin"),
)

# Header
columns = ["Name", "Value", "Status"]
for col, title in enumerate(columns, 1):
    cell = ws.cell(row=1, column=col, value=title)
    cell.font = header_font; cell.fill = header_fill
    cell.alignment = center; cell.border = border

# Data
rows = [["Item A", 100, "OK"], ["Item B", 200, "Pending"], ["Item C", 150, "OK"]]
for r, row in enumerate(rows, 2):
    for c, val in enumerate(row, 1):
        cell = ws.cell(row=r, column=c, value=val)
        cell.alignment = center; cell.border = border

for col in ws.columns:
    ws.column_dimensions[col[0].column_letter].width = 18

wb.save("report.xlsx")
print("report.xlsx generated successfully!")
`,
  xlsxwriter_excel: `import xlsxwriter

wb = xlsxwriter.Workbook("report.xlsx")
ws = wb.add_worksheet("Report")

header_fmt = wb.add_format({"bold": True, "font_color": "white", "bg_color": "#4472C4", "align": "center", "border": 1})
cell_fmt   = wb.add_format({"align": "center", "border": 1})

columns = ["Name", "Value", "Status"]
for col, title in enumerate(columns):
    ws.write(0, col, title, header_fmt)

rows = [["Item A", 100, "OK"], ["Item B", 200, "Pending"], ["Item C", 150, "OK"]]
for r, row in enumerate(rows, 1):
    for c, val in enumerate(row):
        ws.write(r, c, val, cell_fmt)

for i in range(len(columns)):
    ws.set_column(i, i, 18)

wb.close()
print("report.xlsx generated successfully!")
`,
  tabulate_report: `from tabulate import tabulate

data = [["Item A", 100, "OK"], ["Item B", 200, "Pending"], ["Item C", 150, "OK"]]
columns = ["Name", "Value", "Status"]

# Formats: grid, pretty, pipe, html, latex, github, plain, etc.
print(tabulate(data, headers=columns, tablefmt="pretty"))
`,
  pandas_to_html: `import pandas as pd

df = pd.DataFrame({
    "Name":   ["Item A", "Item B", "Item C"],
    "Value":  [100, 200, 150],
    "Status": ["OK", "Pending", "OK"],
})

html = df.to_html(index=False, classes="table table-striped", border=0)
css = (
    "body{font-family:Arial;margin:40px}"
    "h1{color:#2c3e50}"
    ".table{width:100%;border-collapse:collapse}"
    ".table th{background:#3498db;color:white;padding:10px}"
    ".table td{padding:8px;border-bottom:1px solid #ddd}"
    ".table-striped tr:nth-child(even){background:#f8f9fa}"
)
report = f"<!DOCTYPE html><html><head><style>{css}</style></head><body><h1>Report</h1>{html}<p>Total: {len(df)} records</p></body></html>"

from pathlib import Path
Path("report.html").write_text(report, encoding="utf-8")
print("report.html generated successfully!")
print(df.to_string(index=False))
`,
  plotly_line: `# pip install plotly pandas
import os
import plotly.express as px
import pandas as pd
from pathlib import Path
from datetime import datetime

df = pd.DataFrame({
    "date":  ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"],
    "value": [120, 180, 150, 210, 195],
})

fig = px.line(df, x="date", y="value", title="Monthly Trend",
              markers=True, template="plotly_dark")
fig.update_layout(xaxis_title="Month", yaxis_title="Value ($)")

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "line_chart.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")
print(f"Report saved at: {out_file}")
`,
  plotly_bar: `# pip install plotly pandas
import os
import plotly.express as px
import pandas as pd
from pathlib import Path
from datetime import datetime

df = pd.DataFrame({
    "category": ["Product A", "Product B", "Product C", "Product D"],
    "sales":    [350, 520, 280, 610],
    "target":   [400, 500, 300, 600],
})

fig = px.bar(df, x="category", y=["sales", "target"],
             title="Sales vs Target", barmode="group", template="plotly_dark")
fig.update_layout(legend_title="Series")

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "bar_chart.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")
print(f"Report saved at: {out_file}")
`,
  plotly_pie: `# pip install plotly pandas
import os
import plotly.express as px
import pandas as pd
from pathlib import Path
from datetime import datetime

df = pd.DataFrame({
    "segment": ["North", "South", "East", "West", "Central"],
    "revenue": [230, 410, 180, 320, 260],
})

fig = px.pie(df, names="segment", values="revenue",
             title="Revenue Distribution by Segment",
             hole=0.35, template="plotly_dark")
fig.update_traces(textposition="inside", textinfo="percent+label")

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "pie_chart.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")
print(f"Report saved at: {out_file}")
`,
  plotly_table: `# pip install plotly pandas
import os
import plotly.graph_objects as go
import pandas as pd
from pathlib import Path
from datetime import datetime

df = pd.DataFrame({
    "Product": ["Item A", "Item B", "Item C", "Item D"],
    "Qty":     [120, 85, 200, 60],
    "Value":   ["$ 1,200", "$ 850", "$ 2,000", "$ 600"],
    "Status":  ["OK", "Pending", "OK", "Cancelled"],
})

fig = go.Figure(data=[go.Table(
    header=dict(values=[f"<b>{c}</b>" for c in df.columns],
                fill_color="#1e3a5f", font=dict(color="white", size=13),
                align="center", height=32),
    cells=dict(values=[df[c].tolist() for c in df.columns],
               fill_color=[["#1e293b", "#263548"] * (len(df) // 2 + 1)],
               font=dict(color="white"), align="center", height=28),
)])
fig.update_layout(title="Products Table", template="plotly_dark",
                  margin=dict(t=50, l=10, r=10, b=10))

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "table.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")
print(f"Report saved at: {out_file}")
`,
  plotly_dashboard: `# pip install plotly pandas
# Generates a complete HTML with multiple charts (dashboard)
import os
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
from pathlib import Path
from datetime import datetime

# ── Data ─────────────────────────────────────────────────────────────────
months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
revenue  = [120, 180, 150, 210, 195, 230]
expenses = [90,  130, 120, 160, 140, 175]
profit   = [r - e for r, e in zip(revenue, expenses)]

categories = ["Product A", "Product B", "Product C", "Product D"]
sales      = [350, 520, 280, 610]

# ── Dashboard 2×2 ────────────────────────────────────────────────────────────
fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=("Revenue vs Expenses", "Monthly Profit", "Sales by Product", "Margin (%)"),
    specs=[[{"type": "scatter"}, {"type": "bar"}],
           [{"type": "bar"},     {"type": "pie"}]],
)

# Line: Revenue vs Expenses
fig.add_trace(go.Scatter(x=months, y=revenue,  name="Revenue",  mode="lines+markers", line=dict(color="#3b82f6")), row=1, col=1)
fig.add_trace(go.Scatter(x=months, y=expenses, name="Expenses", mode="lines+markers", line=dict(color="#ef4444")), row=1, col=1)

# Bar: Profit
fig.add_trace(go.Bar(x=months, y=profit, name="Profit", marker_color="#10b981"), row=1, col=2)

# Horizontal bar: Sales
fig.add_trace(go.Bar(x=sales, y=categories, orientation="h", name="Sales", marker_color="#8b5cf6"), row=2, col=1)

# Pie: Margin
margin = [round(p / r * 100, 1) for p, r in zip(profit, revenue)]
fig.add_trace(go.Pie(labels=months, values=margin, name="Margin", hole=0.4), row=2, col=2)

fig.update_layout(title_text="Results Dashboard", template="plotly_dark", height=700, showlegend=True)

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "dashboard.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")
print(f"Dashboard saved at: {out_file}")
`,

  // ── Data Science ────────────────────────────────────────────────────────

  ds_pandas_eda: `# pip install pandas numpy
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "customer": ["A", "B", "C", "D", "E", "F"],
    "age": [23, 35, np.nan, 29, 41, 37],
    "income": [3200, 5400, 4100, 3900, 6100, 5800],
    "score": [720, 680, 640, 700, 760, 710],
    "segment": ["retail", "enterprise", "retail", "mid", "enterprise", "mid"],
})

print("=== Sample ===")
print(df.head())

print("\n=== Types ===")
print(df.dtypes)

print("\n=== Missing values ===")
print(df.isna().sum())

print("\n=== Descriptive statistics ===")
print(df.describe(include="all").transpose().fillna(""))

print("\n=== Numeric correlation ===")
print(df.select_dtypes(include="number").corr().round(2))
`,

  ds_train_test_split: `# pip install pandas scikit-learn
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.DataFrame({
    "age": [22, 25, 29, 31, 35, 38, 41, 45],
    "income": [2500, 3200, 4100, 4600, 5200, 6100, 7200, 8100],
    "customer_time": [3, 8, 12, 15, 18, 24, 30, 36],
    "converted": [0, 0, 1, 0, 1, 1, 1, 1],
})

X = df[["age", "income", "customer_time"]]
y = df["converted"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)

print(f"Train: {X_train.shape[0]} rows")
print(f"Test: {X_test.shape[0]} rows")
print("\nX_train:")
print(X_train)
print("\ny_train:")
print(y_train.to_list())
`,

  ds_linear_regression: `# pip install pandas scikit-learn
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

df = pd.DataFrame({
    "marketing_spend": [10, 12, 15, 18, 22, 26, 30, 35],
    "leads": [120, 140, 165, 190, 240, 260, 310, 360],
    "sales": [32, 36, 40, 49, 58, 64, 73, 85],
})

X = df[["marketing_spend", "leads"]]
y = df["sales"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Coefficients:", dict(zip(X.columns, model.coef_.round(3))))
print(f"Intercept: {model.intercept_:.3f}")
print(f"MAE: {mean_absolute_error(y_test, predictions):.3f}")
print(f"R²: {r2_score(y_test, predictions):.3f}")
`,

  ds_kmeans: `# pip install pandas scikit-learn
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

df = pd.DataFrame({
    "customer": ["A", "B", "C", "D", "E", "F"],
    "visits_month": [12, 4, 18, 6, 22, 7],
    "avg_ticket": [120, 340, 95, 280, 110, 260],
    "time_on_site": [8.5, 3.2, 10.1, 4.0, 11.3, 4.6],
})

features = df[["visits_month", "avg_ticket", "time_on_site"]]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)

model = KMeans(n_clusters=3, random_state=42, n_init="auto")
df["cluster"] = model.fit_predict(X_scaled)

centers = pd.DataFrame(
    scaler.inverse_transform(model.cluster_centers_),
    columns=features.columns,
).round(2)

print(df)
print("\nCluster centers:")
print(centers)
`,

  ds_correlation_heatmap: `# pip install pandas plotly
import os
from datetime import datetime
from pathlib import Path

import pandas as pd
import plotly.express as px

df = pd.DataFrame({
    "revenue": [120, 150, 170, 200, 230, 260],
    "marketing": [20, 25, 27, 30, 33, 38],
    "leads": [80, 95, 110, 140, 160, 185],
    "satisfaction": [72, 75, 78, 80, 84, 88],
})

corr = df.corr().round(2)

fig = px.imshow(
    corr,
    text_auto=True,
    color_continuous_scale="Blues",
    zmin=-1,
    zmax=1,
    aspect="auto",
    title="Correlation Heatmap",
)

FILES = Path(os.environ.get("PIPELINE_FILES", "."))
out_dir = FILES / "reports" / datetime.now().strftime("%Y%m%d")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "correlation_heatmap.html"
fig.write_html(str(out_file), include_plotlyjs="cdn")

print(f"Heatmap saved at: {out_file}")
print("\nCorrelation matrix:")
print(corr)
`,

  email_smtp_simples: `import smtplib
from email.mime.text import MIMEText

HOST     = "smtp.example.com"
PORT     = 587
USERNAME = "your@email.com"
PASSWORD = "your-password"

msg = MIMEText("Hello! This e-mail was sent by worchextra.", "plain", "utf-8")
msg["Subject"] = "worchextra Notification"
msg["From"]    = USERNAME
msg["To"]      = "recipient@email.com"

with smtplib.SMTP(HOST, PORT) as smtp:
    smtp.starttls()
    smtp.login(USERNAME, PASSWORD)
    smtp.send_message(msg)

print("E-mail sent successfully!")
`,
  email_smtp_html: `import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

HOST     = "smtp.example.com"
PORT     = 587
USERNAME = "your@email.com"
PASSWORD = "your-password"
DEST     = "recipient@email.com"

msg = MIMEMultipart("alternative")
msg["Subject"] = "Report — worchextra"
msg["From"]    = USERNAME
msg["To"]      = DEST

text = "Hello! The pipeline ran successfully."
html = (
    "<html><body>"
    '<h2 style="color:#2563eb;">worchextra</h2>'
    "<p>Hello! The pipeline ran <strong>successfully</strong>.</p>"
    '<table style="border-collapse:collapse;width:100%;">'
    '<tr style="background:#2563eb;color:#fff;">'
    '<th style="padding:8px;">Step</th><th style="padding:8px;">Status</th>'
    "</tr><tr>"
    '<td style="padding:8px;border:1px solid #e5e7eb;">Step 1</td>'
    '<td style="padding:8px;border:1px solid #e5e7eb;color:#16a34a;">✅ OK</td>'
    "</tr></table></body></html>"
)

msg.attach(MIMEText(text, "plain", "utf-8"))
msg.attach(MIMEText(html, "html",  "utf-8"))

with smtplib.SMTP(HOST, PORT) as smtp:
    smtp.starttls()
    smtp.login(USERNAME, PASSWORD)
    smtp.send_message(msg)

print("HTML e-mail sent successfully!")
`,
  email_smtp_anexo: `import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path

HOST        = "smtp.example.com"
PORT        = 587
USERNAME    = "your@email.com"
PASSWORD    = "your-password"
DEST        = "recipient@email.com"
ATTACHMENT  = "report.pdf"

msg = MIMEMultipart()
msg["Subject"] = "Report attached — worchextra"
msg["From"]    = USERNAME
msg["To"]      = DEST
msg.attach(MIMEText("Please find the requested file attached.", "plain", "utf-8"))

file = Path(ATTACHMENT)
if file.exists():
    with file.open("rb") as f:
        part = MIMEApplication(f.read(), Name=file.name)
    part["Content-Disposition"] = f'attachment; filename="{file.name}"'
    msg.attach(part)
    print(f"Attachment added: {file.name}")
else:
    print(f"File not found: {ATTACHMENT}")

with smtplib.SMTP(HOST, PORT) as smtp:
    smtp.starttls()
    smtp.login(USERNAME, PASSWORD)
    smtp.send_message(msg)

print("E-mail with attachment sent successfully!")
`,
  email_smtp_tls: `# Gmail: enable "App passwords" at https://myaccount.google.com/apppasswords
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

HOST     = "smtp.gmail.com"
PORT     = 587
USERNAME = "your@gmail.com"
PASSWORD = "xxxx xxxx xxxx xxxx"  # app password (16 chars)
DEST     = ["recipient@email.com"]

msg = MIMEMultipart("alternative")
msg["Subject"] = "Notification — worchextra"
msg["From"]    = f"worchextra <{USERNAME}>"
msg["To"]      = ", ".join(DEST)

msg.attach(MIMEText("Pipeline ran successfully!", "plain", "utf-8"))
msg.attach(MIMEText("<h2>✅ Pipeline ran successfully!</h2>", "html", "utf-8"))

with smtplib.SMTP(HOST, PORT) as smtp:
    smtp.ehlo(); smtp.starttls()
    smtp.login(USERNAME, PASSWORD)
    smtp.sendmail(USERNAME, DEST, msg.as_string())

print(f"E-mail sent to: {DEST}")
`,
  rmq_publish: `# pip install pika
import pika

HOST  = "localhost"; PORT = 5672; USER = "guest"; PASS = "guest"
QUEUE = "my_queue"

conn = pika.BlockingConnection(
    pika.ConnectionParameters(host=HOST, port=PORT,
                              credentials=pika.PlainCredentials(USER, PASS)))
ch = conn.channel()
ch.queue_declare(queue=QUEUE, durable=True)

message = "Hello from worchextra!"
ch.basic_publish(exchange="", routing_key=QUEUE, body=message.encode(),
                 properties=pika.BasicProperties(delivery_mode=2))

print(f"✅ Message published to '{QUEUE}': {message}")
conn.close()
`,
  rmq_consume: `# pip install pika
import pika

HOST  = "localhost"; PORT = 5672; USER = "guest"; PASS = "guest"
QUEUE = "my_queue";  MAX_MSGS = 10

conn  = pika.BlockingConnection(
    pika.ConnectionParameters(host=HOST, port=PORT,
                              credentials=pika.PlainCredentials(USER, PASS)))
ch    = conn.channel()
ch.queue_declare(queue=QUEUE, durable=True)
ch.basic_qos(prefetch_count=1)

count = 0
def callback(ch, method, properties, body):
    global count
    print(f"✉ Received [{method.delivery_tag}]: {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)
    count += 1
    if MAX_MSGS and count >= MAX_MSGS:
        ch.stop_consuming()

ch.basic_consume(queue=QUEUE, on_message_callback=callback)
print(f"Waiting for messages in '{QUEUE}'... (Ctrl+C to quit)")
ch.start_consuming()
conn.close()
print(f"Total received: {count}")
`,
  rmq_publish_json: `# pip install pika
import pika, json
from datetime import datetime

HOST  = "localhost"; PORT = 5672; USER = "guest"; PASS = "guest"
QUEUE = "my_queue_json"

payload = {
    "event": "pipeline_executed", "pipeline": "My Pipeline",
    "status": "success", "timestamp": datetime.utcnow().isoformat(),
    "data": {"rows_processed": 1500, "errors": 0},
}

conn = pika.BlockingConnection(
    pika.ConnectionParameters(host=HOST, port=PORT,
                              credentials=pika.PlainCredentials(USER, PASS)))
ch = conn.channel()
ch.queue_declare(queue=QUEUE, durable=True)
ch.basic_publish(exchange="", routing_key=QUEUE,
                 body=json.dumps(payload, ensure_ascii=False).encode(),
                 properties=pika.BasicProperties(delivery_mode=2,
                                                 content_type="application/json"))

print(f"✅ JSON published to '{QUEUE}':")
print(json.dumps(payload, indent=2, ensure_ascii=False))
conn.close()
`,
  rmq_dead_letter: `# pip install pika
# Configures a queue with Dead-Letter Exchange (DLQ)
import pika

HOST="localhost"; PORT=5672; USER="guest"; PASS="guest"
QUEUE="main_queue"; DLX="dlx"; DLQ="dead_queue"; TTL_MS=30_000

conn = pika.BlockingConnection(
    pika.ConnectionParameters(host=HOST, port=PORT,
                              credentials=pika.PlainCredentials(USER, PASS)))
ch = conn.channel()

ch.exchange_declare(exchange=DLX, exchange_type="direct", durable=True)
ch.queue_declare(queue=DLQ, durable=True)
ch.queue_bind(queue=DLQ, exchange=DLX, routing_key=DLQ)

ch.queue_declare(queue=QUEUE, durable=True, arguments={
    "x-dead-letter-exchange": DLX,
    "x-dead-letter-routing-key": DLQ,
    "x-message-ttl": TTL_MS,
})
ch.basic_publish(exchange="", routing_key=QUEUE, body=b"test message",
                 properties=pika.BasicProperties(delivery_mode=2))

print(f"✅ Queue '{QUEUE}' configured with DLQ '{DLQ}' (TTL={TTL_MS}ms)")
conn.close()
`,
  rmq_topic_exchange: `# pip install pika — Topic Exchange: routing by key pattern (*, #)
import pika

HOST="localhost"; PORT=5672; USER="guest"; PASS="guest"; EXCHANGE="topics"

conn = pika.BlockingConnection(
    pika.ConnectionParameters(host=HOST, port=PORT,
                              credentials=pika.PlainCredentials(USER, PASS)))
ch = conn.channel()
ch.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

queue = ch.queue_declare(queue="", exclusive=True).method.queue
ch.queue_bind(exchange=EXCHANGE, queue=queue, routing_key="pipeline.*")

def callback(ch, method, properties, body):
    print(f"✉ [{method.routing_key}] {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

ch.basic_consume(queue=queue, on_message_callback=callback)

for rk, msg in [("pipeline.started",   "Pipeline X started"),
                ("pipeline.completed", "Pipeline X completed"),
                ("report.generated",   "PDF report generated")]:
    ch.basic_publish(exchange=EXCHANGE, routing_key=rk, body=msg.encode())
    print(f"→ Published [{rk}]: {msg}")

print("\\nConsuming messages (pipeline.* only)...")
ch.start_consuming()
`,
  kafka_produce: `# pip install kafka-python
from kafka import KafkaProducer
import json

BROKER = "localhost:9092"; TOPIC = "my-topic"

producer = KafkaProducer(
    bootstrap_servers=BROKER,
    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode(),
    acks="all",
)

payload = {"event": "pipeline_executed", "status": "success"}
meta    = producer.send(TOPIC, value=payload).get(timeout=10)

print(f"✅ Message sent → {TOPIC} | partition {meta.partition} | offset {meta.offset}")
producer.close()
`,
  kafka_consume: `# pip install kafka-python
from kafka import KafkaConsumer
import json

BROKER="localhost:9092"; TOPIC="my-topic"; GROUP="my-group"; MAX_MSGS=10

consumer = KafkaConsumer(TOPIC, bootstrap_servers=BROKER, group_id=GROUP,
                         auto_offset_reset="earliest", enable_auto_commit=True,
                         value_deserializer=lambda b: json.loads(b.decode()))

print(f"Consuming '{TOPIC}' (max {MAX_MSGS} messages)...")
for i, msg in enumerate(consumer, 1):
    print(f"[{i}] partition={msg.partition} offset={msg.offset}: {msg.value}")
    if i >= MAX_MSGS:
        break

consumer.close()
print("Consumption complete.")
`,
  sqs_send: `# pip install boto3
import boto3, json

REGION    = "us-east-1"
QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue"

sqs  = boto3.client("sqs", region_name=REGION)
resp = sqs.send_message(QueueUrl=QUEUE_URL,
                        MessageBody=json.dumps({"event": "pipeline_executed", "status": "success"}))

print(f"✅ Message sent | MessageId: {resp['MessageId']}")
`,
  sqs_receive: `# pip install boto3
import boto3, json

REGION    = "us-east-1"
QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue"
MAX_MSGS  = 10

sqs  = boto3.client("sqs", region_name=REGION)
resp = sqs.receive_message(QueueUrl=QUEUE_URL, MaxNumberOfMessages=MAX_MSGS,
                           WaitTimeSeconds=5)

messages = resp.get("Messages", [])
print(f"Received: {len(messages)} messages")
for msg in messages:
    print(f"  Body: {json.dumps(json.loads(msg['Body']), indent=2)}")
    sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=msg["ReceiptHandle"])
    print("  ✅ Deleted from queue")
`,
  redis_pubsub: `# pip install redis
import redis, threading, time

r       = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
CHANNEL = "my-channel"

def subscriber():
    ps = r.pubsub()
    ps.subscribe(CHANNEL)
    print(f"Subscribed to '{CHANNEL}'. Waiting for messages...")
    for msg in ps.listen():
        if msg["type"] == "message":
            print(f"📩 Received: {msg['data']}")

threading.Thread(target=subscriber, daemon=True).start()
time.sleep(0.5)

for i in range(3):
    message = f"Message {i + 1} from worchextra"
    r.publish(CHANNEL, message)
    print(f"→ Published: {message}")
    time.sleep(0.3)

time.sleep(0.5)
print("Done.")
`,

  whatsapp_twilio_send: `import os
import json
import requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
AUTH_TOKEN  = os.environ["TWILIO_AUTH_TOKEN"]
FROM_NUMBER = "whatsapp:+14155238886"   # Twilio sandbox or approved number
TO_NUMBER   = "whatsapp:+5511999999999"

input_raw = os.environ.get(
  "PIPELINE_INPUT",
  '{"name":"Finance Pipeline","status":"success","duration":"12.5s"}',
)
try:
  payload = json.loads(input_raw)
except json.JSONDecodeError:
  payload = {"message": input_raw}

message = payload.get("message") or (
  f"Pipeline {payload.get('name', 'unnamed')} finished with status "
  f"{payload.get('status', 'unknown')} in {payload.get('duration', 'N/A')}s."
)

response = requests.post(
  f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json",
  auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN),
  data={"From": FROM_NUMBER, "To": TO_NUMBER, "Body": message},
  timeout=20,
)
response.raise_for_status()

data = response.json()
print(json.dumps({
  "sid": data["sid"],
  "status": data.get("status"),
  "to": data.get("to"),
  "body": message,
}, indent=2, ensure_ascii=False))
`,

  sms_twilio_send: `import os
import json
import requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
AUTH_TOKEN  = os.environ["TWILIO_AUTH_TOKEN"]
FROM_NUMBER = "+15551234567"
TO_NUMBER   = "+5511999999999"

input_raw = os.environ.get("PIPELINE_INPUT", '{"code":"ABC123","status":"ready"}')
try:
  payload = json.loads(input_raw)
except json.JSONDecodeError:
  payload = {"message": input_raw}

message = payload.get("message") or (
  f"Automation update: code {payload.get('code', 'N/A')} "
  f"is currently {payload.get('status', 'unknown')}."
)

response = requests.post(
  f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json",
  auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN),
  data={"From": FROM_NUMBER, "To": TO_NUMBER, "Body": message},
  timeout=20,
)
response.raise_for_status()

data = response.json()
print(json.dumps({
  "sid": data["sid"],
  "status": data.get("status"),
  "to": data.get("to"),
  "body": message,
}, indent=2, ensure_ascii=False))
`,

  chatbot_rule_based: `import os
import json

input_raw = os.environ.get("PIPELINE_INPUT", '{"channel":"whatsapp","message":"hi"}')
try:
  payload = json.loads(input_raw)
except json.JSONDecodeError:
  payload = {"message": input_raw}

message = str(payload.get("message") or payload.get("text") or "").strip().lower()
channel = payload.get("channel", "whatsapp")

def reply_for(text: str) -> tuple[str, str, bool]:
  if any(token in text for token in ["hi", "hello", "good morning", "good afternoon", "good evening"]):
    return "Hello. I can help with status, ETA, or transfer you to an agent.", "greeting", False
  if any(token in text for token in ["status", "order", "pipeline", "execution"]):
    return "Your process is under review. Send the reference code if you want a detailed lookup.", "status", False
  if any(token in text for token in ["eta", "deadline", "delivery"]):
    return "Current turnaround time is up to 2 business days.", "eta", False
  if any(token in text for token in ["human", "agent", "support"]):
    return "Understood. I am handing this conversation to the support team.", "handoff", True
  return "I did not fully understand. Try: status, eta, or agent.", "fallback", False

reply, intent, handoff = reply_for(message)

print(json.dumps({
  "channel": channel,
  "intent": intent,
  "handoff": handoff,
  "reply": reply,
  "input": message,
}, indent=2, ensure_ascii=False))
`,
  s3_upload: `# pip install boto3
import boto3
from pathlib import Path

REGION = "us-east-1"; BUCKET = "my-bucket"
FILE   = "report.pdf"; S3_KEY = f"reports/{FILE}"

s3 = boto3.client("s3", region_name=REGION)
s3.upload_file(FILE, BUCKET, S3_KEY)
print(f"✅ Upload complete: https://{BUCKET}.s3.{REGION}.amazonaws.com/{S3_KEY}")
`,
  s3_download: `# pip install boto3
import boto3
from pathlib import Path

REGION = "us-east-1"; BUCKET = "my-bucket"
S3_KEY = "reports/report.pdf"
DEST   = Path("downloads") / Path(S3_KEY).name
DEST.parent.mkdir(parents=True, exist_ok=True)

boto3.client("s3", region_name=REGION).download_file(BUCKET, S3_KEY, str(DEST))
print(f"✅ Download complete: {DEST} ({DEST.stat().st_size} bytes)")
`,
  gcs_upload: `# pip install google-cloud-storage
from google.cloud import storage

PROJECT = "my-gcp-project"; BUCKET = "my-gcs-bucket"
FILE    = "report.pdf";     GCS_KEY = f"reports/{FILE}"

client = storage.Client(project=PROJECT)
client.bucket(BUCKET).blob(GCS_KEY).upload_from_filename(FILE)
print(f"✅ GCS Upload: gs://{BUCKET}/{GCS_KEY}")
`,
  gcs_download: `# pip install google-cloud-storage
from google.cloud import storage
from pathlib import Path

PROJECT = "my-gcp-project"; BUCKET = "my-gcs-bucket"
GCS_KEY = "reports/report.pdf"
DEST    = Path("downloads") / Path(GCS_KEY).name
DEST.parent.mkdir(parents=True, exist_ok=True)

client = storage.Client(project=PROJECT)
client.bucket(BUCKET).blob(GCS_KEY).download_to_filename(str(DEST))
print(f"✅ GCS Download: {DEST} ({DEST.stat().st_size} bytes)")
`,
  azure_blob_upload: `# pip install azure-storage-blob
from azure.storage.blob import BlobServiceClient

CS        = "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
CONTAINER = "my-container"; FILE = "report.pdf"
BLOB_NAME = f"reports/{FILE}"

blob = BlobServiceClient.from_connection_string(CS).get_blob_client(CONTAINER, BLOB_NAME)
with open(FILE, "rb") as f:
    blob.upload_blob(f, overwrite=True)
print(f"✅ Azure Blob Upload: {CONTAINER}/{BLOB_NAME}")
`,
  azure_blob_download: `# pip install azure-storage-blob
from azure.storage.blob import BlobServiceClient
from pathlib import Path

CS        = "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
CONTAINER = "my-container"; BLOB_NAME = "reports/report.pdf"
DEST      = Path("downloads") / Path(BLOB_NAME).name
DEST.parent.mkdir(parents=True, exist_ok=True)

blob = BlobServiceClient.from_connection_string(CS).get_blob_client(CONTAINER, BLOB_NAME)
DEST.write_bytes(blob.download_blob().readall())
print(f"✅ Azure Blob Download: {DEST} ({DEST.stat().st_size} bytes)")
`,
  jwt_generate: `# pip install PyJWT
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "replace-with-strong-secret-key"
ALGORITHM  = "HS256"

payload = {
    "sub": "user123", "name": "John Doe", "role": "admin",
    "iat": datetime.now(timezone.utc),
    "exp": datetime.now(timezone.utc) + timedelta(hours=1),
}

token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print(f"✅ Token generated:\\n{token}")
`,
  jwt_validate: `# pip install PyJWT
import jwt

SECRET_KEY = "replace-with-strong-secret-key"
TOKEN      = "paste-your-token-here"

try:
    decoded = jwt.decode(TOKEN, SECRET_KEY, algorithms=["HS256"])
    print("✅ Valid token:")
    for k, v in decoded.items():
        print(f"  {k}: {v}")
except jwt.ExpiredSignatureError:
    print("❌ Token expired")
except jwt.InvalidTokenError as e:
    print(f"❌ Invalid token: {e}")
`,
  oauth2_client_credentials: `# pip install requests
import requests

resp = requests.post(
    "https://auth.example.com/oauth2/token",
    data={
        "grant_type": "client_credentials",
        "client_id": "my-client-id",
        "client_secret": "my-client-secret",
        "scope": "api.read api.write",
    }, timeout=10,
)
resp.raise_for_status()
data         = resp.json()
access_token = data["access_token"]
print(f"✅ Access token obtained (expires in {data.get('expires_in', '?')}s):")
print(access_token[:60] + "...")
`,
  bcrypt_hash: `# pip install passlib[bcrypt]
from passlib.hash import bcrypt

PASSWORD = "MyStr0ngP@ssword"

hashed = bcrypt.hash(PASSWORD)
print(f"✅ Hash generated:\\n{hashed}")
print(f"\\nCorrect password: {bcrypt.verify(PASSWORD, hashed)}")
print(f"Wrong password:  {bcrypt.verify('wrong-password', hashed)}")
`,
  aes_encrypt: `# pip install cryptography
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from pathlib import Path
import os, base64

key    = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)
print(f"Key (store securely): {base64.b64encode(key).decode()}")

# Encrypt
nonce     = os.urandom(12)
data      = Path("data.txt").read_bytes()
encrypted = nonce + aesgcm.encrypt(nonce, data, None)
Path("data.enc").write_bytes(encrypted)
print("✅ File encrypted: data.enc")

# Decrypt
raw          = Path("data.enc").read_bytes()
nonce2, ct   = raw[:12], raw[12:]
Path("data_decrypted.txt").write_bytes(aesgcm.decrypt(nonce2, ct, None))
print("✅ File decrypted: data_decrypted.txt")
`,
  xml_to_dict: `# pip install xmltodict
import xmltodict, json
from pathlib import Path

data = xmltodict.parse(Path("data.xml").read_text(encoding="utf-8"))
print(json.dumps(data, indent=2, ensure_ascii=False))

Path("output.xml").write_text(xmltodict.unparse(data, pretty=True), encoding="utf-8")
print("\\n✅ XML written to output.xml")
`,
  json_schema_validate: `# pip install jsonschema
import jsonschema, json

SCHEMA = {"type": "object", "required": ["name", "value", "status"],
          "properties": {"name": {"type": "string", "minLength": 1},
                         "value": {"type": "number", "minimum": 0},
                         "status": {"type": "string", "enum": ["active","inactive","pending"]}},
          "additionalProperties": False}

for payload in [{"name": "Product A", "value": 99.90, "status": "active"},
                {"name": "Product B", "value": "hundred", "status": "active"}]:
    try:
        jsonschema.validate(instance=payload, schema=SCHEMA)
        print(f"✅ Valid: {payload}")
    except jsonschema.ValidationError as e:
        print(f"❌ Invalid: {e.message}")
`,
  json_flatten: `# pip install pandas
import pandas as pd, json

data = [
    {"id": 1, "name": "Item A", "meta": {"value": 100, "currency": "USD"}, "tags": ["a", "b"]},
    {"id": 2, "name": "Item B", "meta": {"value": 200, "currency": "EUR"}, "tags": ["c"]},
]

df = pd.json_normalize(data, sep="_")
print(df.to_string(index=False))
df.to_csv("data_flat.csv", index=False)
print("✅ CSV saved to data_flat.csv")
`,
  csv_to_json: `import csv, json
from pathlib import Path

with open("data.csv", newline="", encoding="utf-8") as f:
    records = list(csv.DictReader(f))

Path("data.json").write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"✅ {len(records)} records → data.json")
`,
  json_to_csv: `import csv, json
from pathlib import Path

records = json.loads(Path("data.json").read_text(encoding="utf-8"))
if records:
    with open("output.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader(); writer.writerows(records)
    print(f"✅ {len(records)} records → output.csv")
else:
    print("⚠️ Empty JSON.")
`,
  json_logging: `import logging, json, sys
from datetime import datetime, timezone

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({"ts": datetime.now(timezone.utc).isoformat(),
                           "level": record.levelname, "logger": record.name,
                           "msg": record.getMessage(),
                           **({"exc": self.formatException(record.exc_info)} if record.exc_info else {})},
                          ensure_ascii=False)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
logging.basicConfig(handlers=[handler], level=logging.DEBUG, force=True)
log = logging.getLogger("pipeline")

log.info("Pipeline started")
log.warning("Sample warning")
try:
    1 / 0
except ZeroDivisionError:
    log.error("Error captured", exc_info=True)
`,
  webhook_slack: `# pip install requests
import requests
from datetime import datetime

WEBHOOK_URL = "https://hooks.slack.com/services/TXXXXXX/BXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX"

payload = {"text": "worchextra — Notification",
           "blocks": [{"type": "header", "text": {"type": "plain_text", "text": "✅ Pipeline ran successfully!"}},
                      {"type": "section", "fields": [
                          {"type": "mrkdwn", "text": f"*Pipeline:*\\nMy Pipeline"},
                          {"type": "mrkdwn", "text": "*Status:*\\nsuccess"},
                          {"type": "mrkdwn", "text": "*Duration:*\\n12.5s"},
                          {"type": "mrkdwn", "text": f"*Time:*\\n{datetime.now().strftime('%m/%d/%Y %H:%M')}"},
                      ]}]}

resp = requests.post(WEBHOOK_URL, json=payload, timeout=10)
resp.raise_for_status()
print(f"✅ Slack notification sent (status {resp.status_code})")
`,
  webhook_discord: `# pip install requests
import requests
from datetime import datetime

WEBHOOK_URL = "https://discord.com/api/webhooks/XXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

payload = {"username": "worchextra", "embeds": [{
    "title": "✅ Pipeline ran successfully!", "color": 0x16a34a,
    "fields": [{"name": "Pipeline", "value": "My Pipeline", "inline": True},
               {"name": "Status",   "value": "success",     "inline": True},
               {"name": "Duration", "value": "12.5s",       "inline": True}],
    "footer": {"text": f"worchextra • {datetime.now().strftime('%m/%d/%Y %H:%M')}"},
}]}

resp = requests.post(WEBHOOK_URL, json=payload, timeout=10)
resp.raise_for_status()
print(f"✅ Discord notification sent (status {resp.status_code})")
`,
  webhook_teams: `# pip install requests
import requests
from datetime import datetime

WEBHOOK_URL = "https://outlook.office.com/webhook/XXXXXXXX/IncomingWebhook/XXXXXXXX/XXXXXXXX"

payload = {"@type": "MessageCard", "@context": "http://schema.org/extensions",
           "summary": "Pipeline executed", "themeColor": "16a34a",
           "title": "✅ Pipeline ran successfully!",
           "sections": [{"facts": [
               {"name": "Pipeline", "value": "My Pipeline"},
               {"name": "Status",   "value": "success"},
               {"name": "Duration", "value": "12.5s"},
               {"name": "Time",     "value": datetime.now().strftime("%m/%d/%Y %H:%M")},
           ]}]}

resp = requests.post(WEBHOOK_URL, json=payload, timeout=10)
resp.raise_for_status()
print(f"✅ Teams notification sent (status {resp.status_code})")
`,
  sentry_capture: `# pip install sentry-sdk
import sentry_sdk
from sentry_sdk import capture_exception, capture_message

sentry_sdk.init(dsn="https://XXXX@oXXXX.ingest.sentry.io/XXXX", traces_sample_rate=1.0)

capture_message("Pipeline started", level="info")
print("✅ Message sent to Sentry")

try:
    result = 10 / 0
except ZeroDivisionError as e:
    capture_exception(e)
    print(f"❌ Exception captured and sent to Sentry: {e}")
`,
  prometheus_metric: `# pip install prometheus-client
from prometheus_client import start_http_server, Counter, Gauge, Histogram
import time, random

PORT = 8001
runs_total    = Counter("pipeline_runs_total",       "Total pipeline executions", ["status"])
duration_hist = Histogram("pipeline_duration_seconds","Execution duration (s)", buckets=[1,5,10,30,60,120])
rows_gauge    = Gauge("pipeline_rows_processed",     "Rows processed in last run")

start_http_server(PORT)
print(f"✅ Metrics exposed at http://localhost:{PORT}/metrics")

for i in range(5):
    dur  = random.uniform(2, 15); rows = random.randint(100, 5000); ok = random.random() > 0.2
    runs_total.labels(status="success" if ok else "error").inc()
    duration_hist.observe(dur); rows_gauge.set(rows)
    print(f"Run {i+1}: {'✅' if ok else '❌'} {dur:.1f}s | {rows} rows")
    time.sleep(1)
`,
  docker_list: `# pip install docker
import docker

client = docker.from_env()

print("=== Running containers ===")
for c in client.containers.list():
    print(f"  {c.short_id}  {c.name:<30}  {c.image.tags}  {c.status}")

print("\\n=== Local images ===")
for img in client.images.list():
    tags    = img.tags or ["<no tag>"]
    size_mb = img.attrs["Size"] / 1_048_576
    print(f"  {str(img.short_id):<20}  {tags[0]:<40}  {size_mb:.1f} MB")

client.close()
`,
  docker_run: `# pip install docker
import docker

client  = docker.from_env()
IMAGE   = "python:3.12-slim"
COMMAND = 'python -c "import sys; print(sys.version)"'

print(f"Running: {COMMAND}")
output = client.containers.run(IMAGE, COMMAND, remove=True, stdout=True, stderr=True)
print(f"✅ Output:\\n{output.decode()}")
client.close()
`,
  ssh_command: `# pip install paramiko
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("192.168.1.100", port=22, username="user", password="password")

_, stdout, stderr = client.exec_command("df -h && echo '---' && uptime")
output = stdout.read().decode()
errors = stderr.read().decode()

print(f"=== Output ===\\n{output}")
if errors:
    print(f"=== Errors ===\\n{errors}")

client.close()
print("✅ SSH connection closed")
`,
  sftp_upload: `# pip install paramiko
import paramiko

HOST="192.168.1.100"; PORT=22; USERNAME="user"; PASSWORD="password"
FILE="report.pdf"; DEST=f"/home/{USERNAME}/uploads/{FILE}"

transport = paramiko.Transport((HOST, PORT))
transport.connect(username=USERNAME, password=PASSWORD)
sftp = paramiko.SFTPClient.from_transport(transport)
sftp.put(FILE, DEST)
print(f"✅ SFTP Upload: {FILE} → {DEST}")
sftp.close(); transport.close()
`,
  sftp_download: `# pip install paramiko
import paramiko
from pathlib import Path

HOST="192.168.1.100"; PORT=22; USERNAME="user"; PASSWORD="password"
REMOTE=f"/home/{USERNAME}/uploads/report.pdf"
LOCAL = Path("downloads") / Path(REMOTE).name
LOCAL.parent.mkdir(parents=True, exist_ok=True)

transport = paramiko.Transport((HOST, PORT))
transport.connect(username=USERNAME, password=PASSWORD)
sftp = paramiko.SFTPClient.from_transport(transport)
sftp.get(REMOTE, str(LOCAL))
print(f"✅ SFTP Download: {REMOTE} → {LOCAL} ({LOCAL.stat().st_size} bytes)")
sftp.close(); transport.close()
`,
  edi_edifact_read: `# pip install pydifact
from pydifact.segmentcollection import RawSegmentCollection
from pathlib import Path

collection = RawSegmentCollection.from_str(Path("message.edi").read_text(encoding="utf-8"))
for seg in collection:
    print(f"{seg.tag:8s} {seg.elements}")
`,
  edi_edifact_write: `# pip install pydifact
from pydifact.segmentcollection import RawSegmentCollection
from pydifact.segments import Segment
from pathlib import Path

col = RawSegmentCollection()
col.add_segment(Segment("UNB", ["UNOA","1"],["1234567890","14"],["9876543210","14"],["260101","1000"],"1"))
col.add_segment(Segment("UNH", "1", ["ORDERS","D","96A","UN"]))
col.add_segment(Segment("BGM", "220", "ORD-001", "9"))
col.add_segment(Segment("DTM", ["137","20260101","102"]))
col.add_segment(Segment("UNT", "5", "1"))
col.add_segment(Segment("UNZ", "1", "1"))

msg = col.serialize()
Path("output.edi").write_text(msg, encoding="utf-8")
print(msg)
print("output.edi generated successfully!")
`,
  edi_x12_read: `# Manual X12 EDI reader (no external dependency)
from pathlib import Path

content  = Path("file.x12").read_text(encoding="utf-8")
del_elem = content[3]; del_seg = content[105]

for seg in [s.strip() for s in content.split(del_seg) if s.strip()]:
    fields = seg.split(del_elem)
    print(f"{fields[0]:8s} {fields[1:]}")
`,
  edi_cnab240: `# Parse CNAB 240 return file
from pathlib import Path

def parse_cnab240(path):
    records = []
    for line in Path(path).read_text(encoding="latin-1").splitlines():
        if len(line) >= 240 and line[7] == "3":
            records.append({"type": "3", "segment": line[13],
                            "bank_code": line[0:3], "batch": line[3:7],
                            "payee_name": line[43:73].strip(),
                            "amount": int(line[119:134]) / 100,
                            "our_number": line[73:93].strip()})
    return records

for r in parse_cnab240("return.rem"):
    print(r)
`,
  edi_cnab400: `# Parse CNAB 400 return file
from pathlib import Path

def parse_cnab400(path):
    records = []
    for line in Path(path).read_text(encoding="latin-1").splitlines():
        if len(line) >= 400 and line[0] == "1":
            records.append({"our_number": line[62:70].strip(),
                            "your_number": line[116:126].strip(),
                            "payer_name": line[126:156].strip(),
                            "face_value": int(line[152:165]) / 100,
                            "paid_amount": int(line[253:266]) / 100,
                            "occurrence_date": line[110:116],
                            "occurrence_code": line[108:110]})
    return records

for r in parse_cnab400("return.ret"):
    print(r)
`,
  edi_nfe_xml: `# Read NF-e XML (no extra dependency)
import xml.etree.ElementTree as ET
from pathlib import Path

NS   = {"nfe": "http://www.portalfiscal.inf.br/nfe"}
root = ET.parse("nfe.xml").getroot()

ide   = root.find(".//nfe:ide",NS);  emit = root.find(".//nfe:emit",NS)
dest  = root.find(".//nfe:dest",NS); tot  = root.find(".//nfe:total/nfe:ICMSTot",NS)

print("=== NF-e ===")
print(f"Number   : {ide.findtext('nfe:nNF',   default='',namespaces=NS)}")
print(f"Series   : {ide.findtext('nfe:serie', default='',namespaces=NS)}")
print(f"Issued   : {ide.findtext('nfe:dhEmi', default='',namespaces=NS)}")
print(f"Issuer   : {emit.findtext('nfe:xNome',default='',namespaces=NS)}")
print(f"CNPJ     : {emit.findtext('nfe:CNPJ', default='',namespaces=NS)}")
print(f"Recipient: {dest.findtext('nfe:xNome',default='',namespaces=NS)}")
print(f"Total    : $ {float(tot.findtext('nfe:vNF',default='0',namespaces=NS)):.2f}")
for item in root.findall(".//nfe:det",NS):
    p = item.find("nfe:prod",NS)
    print(f"  {p.findtext('nfe:xProd',namespaces=NS):40s} Qty:{p.findtext('nfe:qCom',namespaces=NS):>8s} Val:$ {float(p.findtext('nfe:vProd',default='0',namespaces=NS)):>10.2f}")
`,
  edi_flat_file: `# Fixed-width positional file — layout definition
from pathlib import Path

LAYOUT = [("record_type",0,1,"str"),("code",1,11,"str"),("name",11,51,"str"),
          ("amount",51,64,"dec2"),("date",64,72,"str"),("sequence",72,78,"int")]

def parse_line(line):
    rec = {}
    for name, start, end, type_ in LAYOUT:
        raw = line[start:end].strip()
        rec[name] = (int(raw) if raw else 0) if type_=="int" else                     (int(raw)/100 if raw else 0.0) if type_=="dec2" else raw
    return rec

for line in Path("file.txt").read_text(encoding="latin-1").splitlines():
    if len(line) >= 78:
        print(parse_line(line))
`,
  ai_openai_chat: `import os, json
from openai import OpenAI

client   = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user",   "content": "Summarize in 3 bullet points what Python is."},
    ],
    temperature=0.7, max_tokens=512,
)
print(response.choices[0].message.content)
`,
  ai_openai_stream: `import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain async/await in Python."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
print()
`,
  ai_openai_function: `import os, json
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
tools  = [{"type": "function", "function": {
    "name": "get_weather",
    "description": "Returns the current temperature of a city",
    "parameters": {"type": "object",
                   "properties": {"city": {"type": "string", "description": "City name"}},
                   "required": ["city"]},
}}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in London?"}],
    tools=tools, tool_choice="auto",
)
msg = response.choices[0].message
if msg.tool_calls:
    for call in msg.tool_calls:
        print(f"Function: {call.function.name}")
        print(f"Args:     {call.function.arguments}")
else:
    print(msg.content)
`,
  ai_openai_vision: `import os
from openai import OpenAI

client   = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "Describe this image in detail."},
        {"type": "image_url", "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/200px-Python-logo-notext.svg.png"}},
    ]}],
    max_tokens=300,
)
print(response.choices[0].message.content)
`,
  ai_openai_embedding: `import os
from openai import OpenAI

client   = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
texts    = ["Python is a programming language",
            "JavaScript runs in the browser",
            "FastAPI is an async web framework"]
response = client.embeddings.create(model="text-embedding-3-small", input=texts)

for i, emb in enumerate(response.data):
    vec = emb.embedding
    print(f"Text {i}: dim={len(vec)}, first 5={vec[:5]}")
`,
  ai_copilot_chat: `import os, requests

token    = os.environ["GITHUB_TOKEN"]
response = requests.post(
    "https://models.inference.ai.azure.com/chat/completions",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"model": "gpt-4o",
          "messages": [
              {"role": "system", "content": "You are a programming assistant."},
              {"role": "user",   "content": "Write a Python function to calculate factorial."},
          ],
          "temperature": 0.3, "max_tokens": 512},
)
response.raise_for_status()
print(response.json()["choices"][0]["message"]["content"])
`,
  ai_copilot_stream: `import os, requests, json

token    = os.environ["GITHUB_TOKEN"]
response = requests.post(
    "https://models.inference.ai.azure.com/chat/completions",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"model": "gpt-4o",
          "messages": [{"role": "user", "content": "Explain list comprehension in Python."}],
          "stream": True},
    stream=True,
)
response.raise_for_status()
for line in response.iter_lines():
    if not line: continue
    text = line.decode("utf-8")
    if text.startswith("data: ") and text != "data: [DONE]":
        delta = json.loads(text[6:])["choices"][0]["delta"].get("content", "")
        if delta:
            print(delta, end="", flush=True)
print()
`,
  ai_copilot_models: `import os, requests

token    = os.environ["GITHUB_TOKEN"]
response = requests.get("https://models.inference.ai.azure.com/models",
                        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
response.raise_for_status()
data  = response.json()
items = data if isinstance(data, list) else data.get("data", [])
for m in items:
    print(f"  - {m.get('id', m.get('name', '?'))}")
`,
  py_if: `if condition:
    print("true")
`,
  py_if_else: `if condition:
    print("true")
else:
    print("false")
`,
  py_if_elif_else: `if value > 100:
    print("high")
elif value > 50:
    print("medium")
else:
    print("low")
`,
  py_ternary: `result = "even" if number % 2 == 0 else "odd"
print(result)
`,
  py_for: `for i in range(10):
    print(i)
`,
  py_for_list: `fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
`,
  py_for_enumerate: `items = ["a", "b", "c"]
for idx, item in enumerate(items):
    print(f"{idx}: {item}")
`,
  py_for_dict: `data = {"name": "John", "age": 30, "city": "NY"}
for key, value in data.items():
    print(f"{key} = {value}")
`,
  py_while: `counter = 0
while counter < 5:
    print(counter)
    counter += 1
`,
  py_while_break: `while True:
    line = input("Type something (or 'quit'): ")
    if line == "quit":
        break
    print(f"You typed: {line}")
`,
  py_def: `def my_function(param1, param2="default"):
    result = f"{param1} - {param2}"
    return result

print(my_function("test"))
`,
  py_def_args: `def sum_all(*args, **kwargs):
    total = sum(args)
    print(f"Sum: {total}")
    for k, v in kwargs.items():
        print(f"  {k} = {v}")

sum_all(1, 2, 3, name="test")
`,
  py_lambda: `double = lambda x: x * 2
square = lambda x: x ** 2

numbers = [1, 2, 3, 4, 5]
print(list(map(double, numbers)))
print(list(filter(lambda x: x > 2, numbers)))
`,
  py_class: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        return f"{self.name}, {self.age} years old"

    def __repr__(self):
        return f"Person({self.name!r}, {self.age})"

p = Person("Mary", 28)
print(p.introduce())
`,
  py_class_inheritance: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return f"{self.name}: Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: Meow!"

for a in [Dog("Rex"), Cat("Mimi")]:
    print(a.speak())
`,
  py_dataclass: `from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0
    tags: list = field(default_factory=list)

    @property
    def total(self):
        return self.price * self.quantity

p = Product("Widget", 9.99, 5, ["electronics"])
print(p, "| Total:", p.total)
`,
  py_match: `command = "start"

match command:
    case "start":
        print("Starting...")
    case "stop":
        print("Stopping...")
    case "status":
        print("Running")
    case _:
        print(f"Unknown command: {command}")
`,
  py_list_comp: `# List comprehension
evens = [x for x in range(20) if x % 2 == 0]
print(evens)

# Dict comprehension
squares = {x: x**2 for x in range(6)}
print(squares)

# Set comprehension
unique = {len(w) for w in ["hi", "hello", "hey", "hi"]}
print(unique)
`,
  py_list_ops: `lst = [3, 1, 4, 1, 5, 9, 2, 6]

lst.append(7)          # add to end
lst.insert(0, 0)       # insert at position
lst.sort()              # sort
lst.reverse()           # reverse

print("List:", lst)
print("Length:", len(lst))
print("Max:", max(lst), "Min:", min(lst))
print("Slice [2:5]:", lst[2:5])
`,
  py_dict_ops: `data = {"name": "John", "age": 30}

# Access with fallback
email = data.get("email", "not provided")

# Add / update
data["city"] = "New York"
data.update({"email": "john@email.com", "active": True})

# Remove
data.pop("active", None)

print(data)
print("Keys:", list(data.keys()))
print("Values:", list(data.values()))
`,
  py_set_ops: `a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print("Union:", a | b)
print("Intersection:", a & b)
print("Difference (a-b):", a - b)
print("Symmetric:", a ^ b)
print("3 in a?", 3 in a)
`,
  py_tuple_unpack: `# Unpacking
point = (10, 20)
x, y = point
print(f"x={x}, y={y}")

# With asterisk
first, *rest, last = [1, 2, 3, 4, 5]
print(f"first={first}, rest={rest}, last={last}")

# Named tuple
from collections import namedtuple
Coord = namedtuple("Coord", ["x", "y", "z"])
p = Coord(1, 2, 3)
print(p.x, p.y, p.z)
`,
  py_try_except: `try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Division error: {e}")
except (ValueError, TypeError) as e:
    print(f"Type/value error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
else:
    print(f"Success: {result}")
finally:
    print("Always runs")
`,
  py_with: `# Context manager — file
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!")

# Multiple contexts
with open("input.txt") as src, open("output.txt", "w") as dst:
    dst.write(src.read().upper())
`,
  py_generator: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num, end=" ")
print()

# Generator expression
total = sum(x**2 for x in range(100))
print(f"Sum of squares: {total}")
`,
  py_decorator: `import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} ran in {end - start:.4f}s")
        return result
    return wrapper

@timer
def process(n):
    return sum(range(n))

print(process(1_000_000))
`,
  py_string_ops: `text = "  Hello, World!  "

print(text.strip())          # remove whitespace
print(text.lower())          # lowercase
print(text.upper())          # uppercase
print(text.replace("World", "Python"))
print(text.split(","))       # split

# f-string formatting
name, value = "Product", 49.9
print(f"{name}: $ {value:.2f}")
print(f"{'centered':^30}")
print(f"{'left':<20}|{'right':>20}")
`,
  py_regex: `import re

text = "E-mail: john@email.com and mary@test.org"

emails = re.findall(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+", text)
print("E-mails:", emails)

clean = re.sub(r"\\d+", "#", "Order 123 from 2024")
print(clean)

m = re.match(r"(\\w+)\\s(\\w+)", "John Smith")
if m:
    print(f"First: {m.group(1)}, Last: {m.group(2)}")
`,
  py_datetime: `from datetime import datetime, timedelta

now      = datetime.now()
print(f"Now: {now:%m/%d/%Y %H:%M:%S}")

tomorrow = now + timedelta(days=1)
print(f"Tomorrow: {tomorrow:%m/%d/%Y}")

dt = datetime.strptime("2026-03-28 14:30", "%Y-%m-%d %H:%M")
print(f"Parsed: {dt}")

diff = tomorrow - now
print(f"Difference: {diff.total_seconds():.0f} seconds")
`,
  py_pathlib: `from pathlib import Path

folder = Path("data")
folder.mkdir(exist_ok=True)

file = folder / "test.txt"
file.write_text("content", encoding="utf-8")
print(file.read_text(encoding="utf-8"))

for f in Path(".").glob("**/*.py"):
    print(f"  {f} ({f.stat().st_size} bytes)")
`,
  py_json: `import json

data    = {"name": "John", "items": [1, 2, 3], "active": True}
json_str = json.dumps(data, ensure_ascii=False, indent=2)
print(json_str)

obj = json.loads(json_str)
print(obj["name"])

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
`,
  py_env_vars: `import os

db_host = os.environ.get("DB_HOST", "localhost")
db_port = int(os.environ.get("DB_PORT", "5432"))
debug   = os.environ.get("DEBUG", "false").lower() == "true"

print(f"DB: {db_host}:{db_port}")
print(f"Debug: {debug}")

for k, v in sorted(os.environ.items()):
    if k.startswith("PIPELINE"):
        print(f"  {k}={v}")
`,
  py_async_def: `import asyncio

async def fetch_data(url: str) -> str:
    print(f"Fetching {url}...")
    await asyncio.sleep(1)  # simulate I/O
    return f"Data from {url}"

async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

asyncio.run(main())
`,
  py_async_gather: `import asyncio

async def task(name: str, seconds: float) -> str:
    print(f"Starting {name}...")
    await asyncio.sleep(seconds)
    print(f"Done {name}")
    return f"{name}: OK"

async def main():
    results = await asyncio.gather(task("A", 2), task("B", 1), task("C", 3))
    for r in results:
        print(r)

asyncio.run(main())
`,
  py_aiohttp: `import asyncio, aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.json()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks   = [fetch(session, u) for u in ["https://httpbin.org/get", "https://httpbin.org/ip"]]
        results = await asyncio.gather(*tasks)
        for r in results:
            print(r)

asyncio.run(main())
`,
  py_type_hints: `# Python 3.12+ — no typing import needed for basic types

def greeting(name: str, age: int = 0) -> str:
    return f"Hello {name}, {age} years old"

def find(id: int) -> dict | None:
    data = {1: {"name": "John"}, 2: {"name": "Mary"}}
    return data.get(id)

def process(value: str | int) -> str:
    return str(value).upper()

names: list[str] = ["a", "b"]
mapping: dict[str, int] = {"x": 1}

print(greeting("Anna", 30))
print(find(1))
print(process(42))
`,
  py_typevar: `# Python 3.12+ — native generics syntax (PEP 695)

class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def __repr__(self) -> str:
        return f"Stack({self._items})"

def first[T](items: list[T]) -> T:
    return items[0]

s: Stack[int] = Stack()
s.push(1); s.push(2)
print(s)
print(first(["a", "b", "c"]))
`,
  py_counter: `from collections import Counter, defaultdict, deque

words = ["a", "b", "a", "c", "b", "a"]
c     = Counter(words)
print("Counter:", c)
print("Top 2:", c.most_common(2))

groups = defaultdict(list)
for name, dept in [("Ana", "IT"), ("Bob", "HR"), ("Leo", "IT")]:
    groups[dept].append(name)
print("Groups:", dict(groups))

queue = deque(maxlen=3)
for i in range(5):
    queue.append(i)
print("Deque:", queue)
`,
  py_itertools: `from itertools import chain, product, combinations, islice, groupby

print(list(chain([1, 2], [3, 4], [5])))

for color, size in product(["red", "blue"], ["S", "M"]):
    print(f"  {color}-{size}")

print(list(combinations("ABCD", 2)))
print(list(islice(range(100), 5, 10)))

data = [("IT", "Ana"), ("IT", "Bob"), ("HR", "Leo"), ("HR", "Lia")]
for dept, members in groupby(data, key=lambda x: x[0]):
    print(f"{dept}: {[m[1] for m in members]}")
`,
  py_functools: `import functools

@functools.lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2: return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"fib(30) = {fibonacci(30)}")
print(f"Cache info: {fibonacci.cache_info()}")

def power(base, exp): return base ** exp
square = functools.partial(power, exp=2)
cube   = functools.partial(power, exp=3)
print(f"5² = {square(5)}, 5³ = {cube(5)}")

from functools import reduce
print(f"Product: {reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])}")
`,
  py_enum: `from enum import Enum, auto

class Status(Enum):
    PENDING  = auto()
    ACTIVE   = auto()
    INACTIVE = auto()
    ERROR    = auto()

class Color(Enum):
    RED   = "#ff0000"
    GREEN = "#00ff00"
    BLUE  = "#0000ff"

status = Status.ACTIVE
print(f"Status: {status.name} = {status.value}")

if status == Status.ACTIVE:
    print("Is active!")

for s in Status:
    print(f"  {s.name}: {s.value}")

color = Color("#00ff00")
print(f"Color: {color.name}")
`,
  py_argparse: `import argparse

parser = argparse.ArgumentParser(description="My CLI script")
parser.add_argument("input", help="Input file")
parser.add_argument("-o", "--output", default="output.txt", help="Output file")
parser.add_argument("-n", "--num", type=int, default=10, help="Count")
parser.add_argument("-v", "--verbose", action="store_true", help="Verbose mode")

args = parser.parse_args()

if args.verbose:
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")

print(f"Processing {args.input} -> {args.output}")
`,
  py_logging: `import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("my_app")

logger.debug("Debug message (not shown with INFO level)")
logger.info("Application started")
logger.warning("High memory usage")
logger.error("Connection failed")

try:
    1 / 0
except ZeroDivisionError:
    logger.exception("Error captured with traceback")
`,
  py_sorted_key: `students = [{"name": "Ana", "grade": 8.5},
            {"name": "Bob", "grade": 9.2},
            {"name": "Leo", "grade": 7.8}]

# By grade (descending)
for s in sorted(students, key=lambda s: s["grade"], reverse=True):
    print(f"  {s['name']}: {s['grade']}")

# Sort ignoring accents
from unicodedata import normalize
names = ["Angela", "Alvaro", "Zelia", "Beatrice"]
print(sorted(names, key=lambda s: normalize("NFKD", s.lower())))

# Multiple criteria
print([s["name"] for s in sorted(students, key=lambda s: (-s["grade"], s["name"]))])
`,
  py_zip: `names  = ["Ana", "Bob", "Leo"]
ages   = [25, 30, 28]
cities = ["New York", "London", "Tokyo"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age} years old, {city}")

people = dict(zip(names, ages))
print(people)

from itertools import zip_longest
print(list(zip_longest([1, 2, 3], ["a", "b"], fillvalue="-")))

pairs = [("a", 1), ("b", 2), ("c", 3)]
letters, numbers = zip(*pairs)
print(letters, numbers)
`,
  py_main: `def main():
    print("Running as main script")

if __name__ == "__main__":
    main()
`,
  py_property: `class Circle:
    def __init__(self, radius: float):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

c = Circle(5)
print(f"Radius: {c.radius}, Area: {c.area:.2f}")
c.radius = 10
print(f"Radius: {c.radius}, Area: {c.area:.2f}")
`,
  py_static_class: `class MathUtils:
    PI = 3.14159

    @staticmethod
    def add(a, b):
        return a + b

    @classmethod
    def info(cls):
        return f"PI = {cls.PI}"

    @classmethod
    def create_with_config(cls, config: dict):
        inst = cls()
        inst.config = config
        return inst

print(MathUtils.add(2, 3))
print(MathUtils.info())
`,
  py_contextmanager: `from contextlib import contextmanager
import time

@contextmanager
def timer(label="Block"):
    start = time.perf_counter()
    try:
        yield
    finally:
        end = time.perf_counter()
        print(f"{label}: {end - start:.4f}s")

@contextmanager
def temp_file(content: str):
    import tempfile, os
    path = tempfile.mktemp(suffix=".txt")
    with open(path, "w") as f:
        f.write(content)
    try:
        yield path
    finally:
        os.unlink(path)

with timer("Processing"):
    total = sum(range(1_000_000))
    print(f"Total: {total}")

with temp_file("temporary data") as path:
    print(f"File: {path}")
    print(open(path).read())
`,
  py_slots: `class PointNormal:
    def __init__(self, x, y):
        self.x = x; self.y = y

class PointOptimized:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x; self.y = y
    def distance(self, other):
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5

import sys
p1 = PointNormal(1, 2); p2 = PointOptimized(1, 2)
print(f"Normal:    {sys.getsizeof(p1.__dict__)} bytes (dict)")
print(f"__slots__: no __dict__ — lighter")
print(f"Distance: {p2.distance(PointOptimized(4, 6)):.2f}")
`,
  py_abc: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

    def description(self) -> str:
        return f"{self.__class__.__name__}: area={self.area():.2f}"

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width; self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

r = Rectangle(5, 3)
print(r.description())
print(f"Perimeter: {r.perimeter()}")
`,
  py_walrus: `# Walrus operator := (Python 3.8+)
import random
while (n := random.randint(1, 10)) != 7:
    print(f"Trying... {n}")
print(f"Found: {n}")

data = ["abc", "", "hello world", "hi", ""]
long_ones = [upper for s in data if (upper := s.upper()) and len(upper) > 3]
print(long_ones)

import re
text = "Price: $ 49.90"
if (m := re.search(r"\\$\\s*([\\d.]+)", text)):
    print(f"Value found: {m.group(1)}")
`,
};

const CYTHON_BOILERPLATES = {
  cy_hello: `# cython: language_level=3
import os

def hello():
    cdef str msg = "Hello from Cython!"
    print(msg)
    input_value = os.environ.get("PIPELINE_INPUT", "")
    if input_value:
        print(f"Input: {input_value}")

hello()
`,
  cy_typed_func: `# cython: language_level=3
def add(double x, double y) -> double:
    """Typed function — faster than pure Python."""
    cdef double result = x + y
    return result

print(add(3.14, 2.72))
`,
  cy_fibonacci: `# cython: language_level=3
def fibonacci(int n) -> int:
    """Compute nth Fibonacci number with C-speed."""
    cdef int a = 0, b = 1, i
    for i in range(n - 1):
        a, b = b, a + b
    return b

print(fibonacci(50))
`,
  cy_prime_sieve: `# cython: language_level=3
def sieve(int n):
    """Sieve of Eratosthenes up to n."""
    cdef list flags = [True] * (n + 1)
    cdef int i, j
    flags[0] = flags[1] = False
    for i in range(2, int(n**0.5) + 1):
        if flags[i]:
            for j in range(i * i, n + 1, i):
                flags[j] = False
    primes = [i for i in range(2, n + 1) if flags[i]]
    print(f"Found {len(primes)} primes up to {n}")
    print("Last 5:", primes[-5:])

sieve(10000)
`,
  cy_typed_array: `# cython: language_level=3
import array

def sum_array(double[:] arr) -> double:
    cdef int i, n = arr.shape[0]
    cdef double total = 0.0
    for i in range(n):
        total += arr[i]
    return total

data = array.array('d', range(1, 101))
print(f"Sum 1..100 = {sum_array(data)}")
`,
  cy_memoryview: `# cython: language_level=3
def scale(double[:] arr, double factor):
    cdef int i
    for i in range(arr.shape[0]):
        arr[i] *= factor

import array
data = array.array('d', [1.0, 2.0, 3.0, 4.0, 5.0])
scale(data, 10.0)
print(list(data))
`,
  cy_matrix: `# cython: language_level=3
def mat_mul(double[:, :] A, double[:, :] B, double[:, :] C):
    cdef int i, j, k
    cdef int m = A.shape[0], n = B.shape[1], p = A.shape[1]
    for i in range(m):
        for j in range(n):
            C[i][j] = 0.0
            for k in range(p):
                C[i][j] += A[i][k] * B[k][j]

import array
n = 3
flat = array.array('d', [float(i) for i in range(n * n)])
A = (flat[:], flat[:])
print("Matrix multiply stub — adapt with numpy for full use")
`,
  cy_cdef_class: `# cython: language_level=3
cdef class Point:
    cdef public double x, y

    def __init__(self, double x, double y):
        self.x = x
        self.y = y

    cpdef double distance(self, Point other):
        cdef double dx = self.x - other.x
        cdef double dy = self.y - other.y
        return (dx * dx + dy * dy) ** 0.5

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p1 = Point(0, 0)
p2 = Point(3, 4)
print(f"Distance: {p1.distance(p2)}")
`,
  cy_prange: `# cython: language_level=3
# Note: prange requires OpenMP. Use plain range if not available.
def parallel_sum(int n) -> long:
    cdef long total = 0
    cdef int i
    for i in range(n):
        total += i
    return total

print(f"Sum 0..999999 = {parallel_sum(1_000_000)}")
`,
  cy_benchmark: `# cython: language_level=3
import os, time

def count_up(long n) -> long:
    cdef long i, total = 0
    for i in range(n):
        total += i
    return total

n = 10_000_000
t0 = time.perf_counter()
result = count_up(n)
elapsed = time.perf_counter() - t0
print(f"Sum 0..{n-1} = {result}")
print(f"Time: {elapsed*1000:.1f} ms (Cython C-speed)")
`,

  // ── Real-world example ──────────────────────────────────────────────────
  cy_csv_stats: `# cython: language_level=3
# Real-world example: read and analyze CSV at C speed
# Generates a 500k-row CSV in memory and calculates statistics.
import io, time

def parse_csv_stats(str csv_text):
    """Calculate min, max, sum, and count for a numeric column."""
    cdef double val, total = 0.0, mn = 1e18, mx = -1e18
    cdef long count = 0
    cdef str line
    cdef bint first = True
    for line in csv_text.split('\\n'):
        if first:          # skip header
            first = False
            continue
        if not line:
            continue
        parts = line.split(',')
        if len(parts) < 2:
            continue
        try:
            val = float(parts[1])
        except ValueError:
            continue
        total += val
        count += 1
        if val < mn: mn = val
        if val > mx: mx = val
    return count, mn, mx, total / count if count else 0.0

# Generate synthetic CSV with 500,000 rows
N = 500_000
buf = io.StringIO()
buf.write("id,value\\n")
for i in range(N):
    buf.write(f"{i},{(i * 1.1) % 1000:.4f}\\n")
csv_data = buf.getvalue()

t0 = time.perf_counter()
count, mn, mx, avg = parse_csv_stats(csv_data)
elapsed = time.perf_counter() - t0

print(f"Processed rows : {count:,}")
print(f"Minimum        : {mn:.4f}")
print(f"Maximum        : {mx:.4f}")
print(f"Average        : {avg:.4f}")
print(f"Time           : {elapsed*1000:.1f} ms")
`,
};

const GOLANG_BOILERPLATES = {
  go_hello: `package main

import (
	"fmt"
	"os"
)

func main() {
	input := os.Getenv("PIPELINE_INPUT")
	if input != "" {
		fmt.Println("Input received:", input)
	}
	fmt.Println("Hello from Go!")
}
`,
  go_fibonacci: `package main

import "fmt"

func fibonacci(n int) int {
	a, b := 0, 1
	for i := 0; i < n-1; i++ {
		a, b = b, a+b
	}
	return b
}

func main() {
	for _, n := range []int{10, 20, 30, 40, 50} {
		fmt.Printf("fibonacci(%d) = %d\\n", n, fibonacci(n))
	}
}
`,
  go_benchmark: `package main

import (
	"fmt"
	"time"
)

func main() {
	const N = 10_000_000
	start := time.Now()
	total := int64(0)
	for i := 0; i < N; i++ {
		total += int64(i)
	}
	elapsed := time.Since(start)
	fmt.Printf("Sum 0..%d = %d\\n", N-1, total)
	fmt.Printf("Elapsed: %v\\n", elapsed)
}
`,
  go_goroutines: `package main

import (
	"fmt"
	"sync"
)

func worker(id int, wg *sync.WaitGroup, results chan<- string) {
	defer wg.Done()
	results <- fmt.Sprintf("worker %d completed", id)
}

func main() {
	const numWorkers = 5
	results := make(chan string, numWorkers)
	var wg sync.WaitGroup

	for i := 1; i <= numWorkers; i++ {
		wg.Add(1)
		go worker(i, &wg, results)
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	for r := range results {
		fmt.Println(r)
	}
}
`,
  go_json: `package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Order struct {
	ID    int     \`json:"id"\`
	Item  string  \`json:"item"\`
	Value float64 \`json:"value"\`
}

func main() {
	// Decode from PIPELINE_INPUT (JSON) or use default
	input := os.Getenv("PIPELINE_INPUT")
	if input == "" {
		input = \`{"id":1,"item":"Product A","value":99.90}\`
	}

	var p Order
	if err := json.Unmarshal([]byte(input), &p); err != nil {
		fmt.Println("Decode error:", err)
		return
	}
	fmt.Printf("Order #%d: %s — $ %.2f\\n", p.ID, p.Item, p.Value)

	// Re-encode
	out, _ := json.MarshalIndent(p, "", "  ")
	fmt.Println(string(out))
}
`,
  go_strings: `package main

import (
	"fmt"
	"strings"
)

func main() {
  s := "  worchextra — Go node  "
	fmt.Println(strings.TrimSpace(s))
	fmt.Println(strings.ToUpper(s))
	fmt.Println(strings.Contains(s, "Go"))
	fmt.Println(strings.Replace(s, "Go", "Golang", 1))

	parts := strings.Split("a,b,c,d", ",")
	fmt.Println(parts)
	fmt.Println(strings.Join(parts, " | "))
}
`,
  go_regex: `package main

import (
	"fmt"
	"regexp"
)

func main() {
	re := regexp.MustCompile(\`\\d{4}-\\d{2}-\\d{2}\`)
	text := "Datas: 2026-05-12 e 2025-01-01"

	matches := re.FindAllString(text, -1)
	fmt.Println("Datas encontradas:", matches)

	// Named groups
	re2 := regexp.MustCompile(\`(?P<ano>\\d{4})-(?P<mes>\\d{2})-(?P<dia>\\d{2})\`)
	match := re2.FindStringSubmatch("2026-05-12")
	names := re2.SubexpNames()
	for i, name := range names {
		if i != 0 && name != "" {
			fmt.Printf("%s = %s\\n", name, match[i])
		}
	}
}
`,
  go_sort: `package main

import (
	"fmt"
	"sort"
)

func main() {
	nums := []int{5, 2, 8, 1, 9, 3}
	sort.Ints(nums)
	fmt.Println("Inteiros:", nums)

	words := []string{"banana", "apple", "cherry", "date"}
	sort.Strings(words)
	fmt.Println("Strings:", words)

	// Custom sort: by length
	sort.Slice(words, func(i, j int) bool {
		return len(words[i]) < len(words[j])
	})
	fmt.Println("Por tamanho:", words)
}
`,
  go_csv: `package main

import (
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"
)

func main() {
	raw := \`name,value
Alice,150.5
Bob,230.0
Carol,87.3
Dave,412.9\`

	r := csv.NewReader(strings.NewReader(raw))
	records, err := r.ReadAll()
	if err != nil {
		fmt.Println("Erro:", err)
		return
	}

	total := 0.0
	for _, row := range records[1:] { // skip header
		v, _ := strconv.ParseFloat(row[1], 64)
		fmt.Printf("%-10s R$ %.2f\\n", row[0], v)
		total += v
	}
	fmt.Printf("\\nTotal: R$ %.2f\\n", total)
}
`,
};

const RUST_BOILERPLATES = {
  rust_hello: `use std::env;

fn main() {
  let input = env::var("PIPELINE_INPUT").unwrap_or_default();
  if !input.is_empty() {
    println!("Input received: {}", input);
  }
  println!("Hello from Rust!");
}
`,
  rust_fibonacci: `fn fibonacci(n: u32) -> u64 {
  let (mut a, mut b) = (0_u64, 1_u64);
  for _ in 0..n {
    let next = a + b;
    a = b;
    b = next;
  }
  a
}

fn main() {
  for n in [10, 20, 30, 40, 50] {
    println!("fibonacci({}) = {}", n, fibonacci(n));
  }
}
`,
  rust_benchmark: `use std::time::Instant;

fn main() {
  const N: u64 = 10_000_000;
  let start = Instant::now();
  let total: u64 = (0..N).sum();
  println!("Sum 0..{} = {}", N - 1, total);
  println!("Elapsed: {:?}", start.elapsed());
}
`,
  rust_vectors: `fn main() {
  let values = vec![5, 2, 8, 1, 9, 3];
  let mut sorted = values.clone();
  sorted.sort();

  let doubled: Vec<i32> = sorted.iter().map(|v| v * 2).collect();
  let total: i32 = sorted.iter().sum();

  println!("Sorted : {:?}", sorted);
  println!("Doubled: {:?}", doubled);
  println!("Total  : {}", total);
}
`,
  rust_hashmap: `use std::collections::HashMap;

fn main() {
  let rows = [
    ("sales", 150.5),
    ("ops", 230.0),
    ("sales", 87.3),
    ("finance", 412.9),
  ];

  let mut totals: HashMap<&str, f64> = HashMap::new();
  for (dept, value) in rows {
    *totals.entry(dept).or_insert(0.0) += value;
  }

  for (dept, total) in totals {
    println!("{:<10} R$ {:.2}", dept, total);
  }
}
`,
  rust_pipeline_input: `use std::env;

fn main() {
  let input = env::var("PIPELINE_INPUT").unwrap_or_else(|_| "".to_string());
  if input.is_empty() {
    println!("No PIPELINE_INPUT received");
  } else {
    println!("PIPELINE_INPUT: {}", input);
    println!("Bytes: {}", input.len());
  }
}
`,
  rust_files: `use std::env;
use std::fs;
use std::path::PathBuf;

fn main() -> std::io::Result<()> {
  let files_dir = env::var("PIPELINE_FILES").unwrap_or_else(|_| ".".to_string());
  let path = PathBuf::from(files_dir);

  println!("PIPELINE_FILES: {}", path.display());
  for entry in fs::read_dir(path)? {
    let entry = entry?;
    let meta = entry.metadata()?;
    if meta.is_file() {
      println!("{} ({} bytes)", entry.file_name().to_string_lossy(), meta.len());
    }
  }
  Ok(())
}
`,
};

  const KOTLIN_BOILERPLATES = {
    kt_hello: `fun main() {
    val input = System.getenv("PIPELINE_INPUT").orEmpty()
    if (input.isNotBlank()) {
      println("Input received: " + input)
    }
    println("Hello from Kotlin!")
  }
  `,
    kt_fibonacci: `fun fibonacci(n: Int): Long {
    var a = 0L
    var b = 1L
    repeat(n) {
      val next = a + b
      a = b
      b = next
    }
    return a
  }

  fun main() {
    listOf(10, 20, 30, 40, 50).forEach { n ->
      println("fibonacci(" + n + ") = " + fibonacci(n))
    }
  }
  `,
    kt_benchmark: `import kotlin.system.measureTimeMillis

  fun main() {
    val n = 10_000_000L
    var total = 0L
    val elapsed = measureTimeMillis {
      for (i in 0 until n) {
        total += i
      }
    }
    println("Sum 0.." + (n - 1) + " = " + total)
    println("Elapsed: " + elapsed + " ms")
  }
  `,
    kt_lists: `fun main() {
    val values = listOf(5, 2, 8, 1, 9, 3)
    val sorted = values.sorted()
    val doubled = sorted.map { it * 2 }
    val total = sorted.sum()

    println("Sorted : " + sorted)
    println("Doubled: " + doubled)
    println("Total  : " + total)
  }
  `,
    kt_maps: `fun main() {
    val rows = listOf(
      "sales" to 150.5,
      "ops" to 230.0,
      "sales" to 87.3,
      "finance" to 412.9,
    )

    val totals = rows.groupingBy { it.first }
      .fold(0.0) { acc, row -> acc + row.second }

    totals.forEach { dept, total ->
      println(dept.padEnd(10) + " R$ " + "%.2f".format(total))
    }
  }
  `,
    kt_pipeline_input: `fun main() {
    val input = System.getenv("PIPELINE_INPUT").orEmpty()
    if (input.isBlank()) {
      println("No PIPELINE_INPUT received")
    } else {
      println("PIPELINE_INPUT: " + input)
      println("Bytes: " + input.toByteArray().size)
    }
  }
  `,
    kt_files: `import java.nio.file.Files
  import java.nio.file.Path

  fun main() {
    val filesDir = System.getenv("PIPELINE_FILES") ?: "."
    val root = Path.of(filesDir)

    println("PIPELINE_FILES: " + root.toAbsolutePath())
    Files.list(root).use { stream ->
      stream.filter { Files.isRegularFile(it) }.forEach { path ->
        println(path.fileName.toString() + " (" + Files.size(path) + " bytes)")
      }
    }
  }
  `,
  };

export { BOILERPLATES, CYTHON_BOILERPLATES, GOLANG_BOILERPLATES, RUST_BOILERPLATES, KOTLIN_BOILERPLATES };
