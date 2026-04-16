
# 🌟 Smart Campus Operations Hub

## 🔗 Modern Smart Campus Management Platform

Smart Campus Operations Hub is a **web-based system developed for IT3030 – PAF Assignment**.  
It is designed to manage **campus facilities, resource bookings, and maintenance operations** efficiently using a structured and scalable approach.

---

## 📌 What This System Promotes

- 🏫 Efficient Resource Management  
- 🤝 Organized Campus Operations  
- ⏱️ Real-time Booking & Availability Tracking  
- 📊 Data-driven Decision Making  

---

## ❗ Problem Statement

Many universities face operational challenges such as:

- ❌ Manual resource booking systems  
- ❌ No centralized facility management  
- ❌ Lack of real-time availability tracking  
- ❌ Booking conflicts and scheduling issues  
- ❌ Poor maintenance and incident tracking  

---

## ✅ Our Solution

Smart Campus Operations Hub addresses these issues by providing:

- ✔️ Centralized **Facilities & Assets Catalogue**  
- ✔️ Real-time **resource availability tracking**  
- ✔️ Structured **booking workflow system**  
- ✔️ Conflict prevention for overlapping bookings  
- ✔️ Maintenance & incident reporting system  
- ✔️ Role-based access control (Admin / User)  

---

## ⚡ Why This System is Different

- 🚀 Built using modern **Spring Boot + MongoDB architecture**  
- 🎯 Follows **real-world workflow processes**  
- 🔐 Secure and scalable system design  
- 💡 Clean and user-friendly interface  
- 📈 Designed for future expansion (notifications, analytics)  

---

## 🏫 Module A – Facilities & Assets Catalogue

- Manage all campus resources:
  - Lecture Halls  
  - Labs  
  - Meeting Rooms  
  - Equipment (Projectors, Cameras, etc.)  

- Each resource contains:
  - Name  
  - Type  
  - Capacity  
  - Location  
  - Availability  
  - Status (ACTIVE / OUT_OF_SERVICE)  

- 🔍 Features:
  - Search functionality  
  - Filtering by type, capacity, and location  

---

## 🛠️ Tech Stack

| Layer       | Technology Used |
|------------|----------------|
| Frontend   | HTML, CSS, JavaScript |
| Backend    | Spring Boot (Java REST API) |
| Database   | MongoDB |

---


---

## ▶️ Running the Project

### 🔹 Backend Setup


Server runs at:  
👉 http://localhost:8080

---

### 🔹 Frontend Setup



---

## 🔌 API Endpoints (Sample)

- `GET /api/resources` → Get all resources  
- `POST /api/resources` → Add new resource  
- `PUT /api/resources/{id}` → Update resource  
- `DELETE /api/resources/{id}` → Delete resource  

---

## 🎯 Assignment Alignment

This project satisfies the **IT3030 – PAF Assignment requirements**:

✔ Spring Boot REST API implementation  
✔ MongoDB database integration  
✔ Facilities & Assets Catalogue (Module A)  
✔ Clean UI for user interaction  
✔ GitHub version control with proper structure  

:contentReference[oaicite:0]{index=0}

---

## 🚀 Future Enhancements

- 📅 Complete booking system (Module B)  
- 🔔 Notification system (Module D)  
- 📊 Admin analytics dashboard  
- 🔐 OAuth 2.0 authentication (Google login)  
- 🛠️ Maintenance & Incident module (Module C)  

---

## 📂 Project Structure


it3030-paf-2026-smart-campus-group426
│
├── backend/ (Spring Boot REST API)
│   ├── src/main/java/com/smartcampus/
│   │   ├── controller/        # REST Controllers (API endpoints)
│   │   ├── service/           # Business logic layer
│   │   ├── repository/        # MongoDB repositories
│   │   ├── model/             # Data models (Entities)
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── config/            # Security & configurations
│   │   └── SmartCampusApplication.java
│   │
│   ├── src/main/resources/
│   │   ├── application.properties   # DB & server configs
│   │   └── static/                  # Static files (if used)
│   │
│   └── pom.xml
│
├── frontend/ (Client Web Application)
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript logic
│   ├── pages/                # HTML pages
│   ├── assets/               # Images & icons
│   └── index.html
│
├── .github/
│   └── workflows/            # GitHub Actions (CI/CD pipeline)
│
├── docs/                     # Reports, diagrams, screenshots
│
└── README.md
