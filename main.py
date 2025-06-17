import requests
import firebase_admin
from firebase_admin import credentials, db
import time

# ✅ Firebase credentials load
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://dark-tools-93abd-default-rtdb.firebaseio.com/"
})

uploaded_issues = set()
last_issue_number = None

def fetch_and_update():
    global last_issue_number

    try:
        url = "https://crbbb.com/api/webapi/GetNoaverageEmerdList"
        headers = {"Content-Type": "application/json;charset=UTF-8"}
        body = {
            "pageSize": 10,
            "pageNo": 1,
            "typeId": 30,
            "language": 0,
            "random": "62d02162c2234c64b57aa4188c5810b2",
            "signature": "9BF7A245709AA054E231D75C404C6527",
            "timestamp": int(time.time())
        }

        res = requests.post(url, headers=headers, json=body)
        json_data = res.json()
        items = json_data.get("data", {}).get("list", [])

        if not items:
            print("No data found.")
            return

        latest = items[0]  # ✅ শুধু প্রথম (সর্বশেষ) item
        issue_number = latest["issueNumber"]

        if issue_number != last_issue_number and issue_number not in uploaded_issues:
            db.reference("HACK").push({
                "number": latest["number"],
                "issueNumber": issue_number,
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            uploaded_issues.add(issue_number)
            last_issue_number = issue_number
            print("✅ Pushed:", latest["number"])

    except Exception as e:
        print("❌ Error:", e)

# ✅ Infinite loop to auto-run
while True:
    fetch_and_update()
    time.sleep(30)  # প্রতি ৩০ সেকেন্ডে আবার