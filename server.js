const express = require("express");
const fetch = require("node-fetch");
const firebase = require("firebase/app");
require("firebase/database");

const app = express();
const port = process.env.PORT || 3000;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAWs4V81fLFH6khFkHe0oJIbJeXuZs1DI4",
  authDomain: "dark-tools-93abd.firebaseapp.com",
  databaseURL: "https://dark-tools-93abd-default-rtdb.firebaseio.com",
  projectId: "dark-tools-93abd",
  storageBucket: "dark-tools-93abd.appspot.com",
  messagingSenderId: "1003509016475",
  appId: "1:1003509016475:android:826836719187aa12fc633e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let lastIssueNumber = null;

async function fetchAndUpdate() {
  try {
    const res = await fetch("https://crbbb.com/api/webapi/GetNoaverageEmerdList", {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify({
        pageSize: 10,
        pageNo: 1,
        typeId: 30,
        language: 0,
        random: "62d02162c2234c64b57aa4188c5810b2",
        signature: "9BF7A245709AA054E231D75C404C6527",
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });

    const json = await res.json();
    const list = json?.data?.list;
    if (!list?.length) return;

    const latest = list[0];
    const currentIssue = latest.issueNumber;

    if (currentIssue !== lastIssueNumber) {
      lastIssueNumber = currentIssue;
      db.ref("HACK").push({
        number: latest.number,
        issueNumber: latest.issueNumber,
        time: new Date().toISOString(),
      });
      console.log("✅ নতুন নাম্বার আপলোড:", latest.number);
    }

  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

// ⏱️ ৩০ সেকেন্ড পরপর ফাংশন চালাবে
setInterval(fetchAndUpdate, 30 * 1000);

app.get("/", (req, res) => {
  res.send("📡 Server is running and syncing with Firebase...");
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});