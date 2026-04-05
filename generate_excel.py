import json
import pandas as pd

try:
    data = json.load(open("audit.json"))
    rows = data["spreadsheet_rows"]
    df = pd.DataFrame(rows)
    df.to_excel("seo_audit.xlsx", index=False)
    print("Successfully generated seo_audit.xlsx")
except Exception as e:
    print(f"Error: {e}")
