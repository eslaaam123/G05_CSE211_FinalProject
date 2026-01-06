==================================================
          EventsX - Event Management Website
==================================================

Course: CSE211 Web Programming
Date: January 2026
Team Members:
  - Eslam Nader Nasralden (221100268)
  - Mohamed Ahmed Morsy (221100557)
  - Basel Mohamed Ahmed (222100363)
  - Youssef Khaled (222101945)

==================================================
                 PROJECT OVERVIEW
==================================================

EventsX is a web-based platform for managing and booking events 
in Egypt. Users can browse upcoming events, register for events, 
calculate event budgets, and contact the organizers.

==================================================
                    FEATURES
==================================================

1. User Authentication
   - Login and registration system
   - Secure password storage
   - User session management

2. Event Browsing
   - View all upcoming events
   - Search and filter events by category
   - See event details (date, location, cost)

3. Event Registration
   - Register for events
   - Select number of tickets
   - Add special requirements/notes
   - Multiple registrations allowed

4. Budget Calculator
   - Calculate event planning costs
   - Select different services (catering, venue, etc.)
   - See cost breakdown in real-time

5. Contact System
   - Contact form for inquiries
   - Social media links
   - Company information

==================================================
              TECHNOLOGIES USED
==================================================

Frontend:
  - HTML5
  - CSS3 (with responsive design)
  - JavaScript (ES6)

Backend:
  - PHP
  - MySQL Database

APIs:
  - RESTful API structure
  - JSON data format

==================================================
              INSTALLATION GUIDE
==================================================

1. Prerequisites:
   - XAMPP (or similar local server)
   - Web browser (Chrome, Firefox, etc.)

2. Setup Database:
   - Open phpMyAdmin
   - Create new database: eventx_db
   - Import the database SQL file
   - Or run the setup SQL script

3. Configure Backend:
   - Open backend/config.php
   - Update database credentials if needed:
     * DB_HOST: localhost
     * DB_USER: root
     * DB_PASS: (empty for XAMPP)
     * DB_NAME: eventx_db

4. Run the Website:
   - Place project folder in htdocs (XAMPP)
   - Start Apache and MySQL from XAMPP
   - Open browser: http://localhost/project-folder/

==================================================
                  HOW TO USE
==================================================

For Users:
1. Open the website homepage
2. Browse available events
3. Click "Login/Register" to create account
4. Fill registration form with your details
5. After login, go to Registration page
6. Select an event and number of tickets
7. Submit registration
8. You'll see confirmation message

For Budget Planning:
1. Go to Budget Calculator page
2. Select event type
3. Enter number of guests
4. Check services you need
5. Click Calculate to see total cost

==================================================
              DATABASE STRUCTURE
==================================================

Tables:
1. users
   - id, name, email, password, phone

2. events
   - id, name, date, location, cost, category, 
     image, description

3. registrations
   - id, user_id, event_id, tickets, notes,
     registration_date


==================================================
                    NOTES
==================================================

- All passwords are securely hashed
- User can register multiple times for same event
- Registration requires login first
- Search and filter work in real-time
- Website is fully responsive for mobile devices

==================================================
              KNOWN LIMITATIONS
==================================================

- No payment gateway integration
- No email confirmation system
- No admin panel for event management
- Images must be added manually to server



==================================================
                   LICENSE
==================================================

This project was created for educational purposes
as part of CSE211 Web Programming course.

© 2026 EventsX - All Rights Reserved

==================================================