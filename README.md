# Room Lottery System

The **Room Lottery System** is a full-stack web application built for a school project to fairly and efficiently manage student applications for limited school housing. The system prioritizes students based on their academic and athletic status and allows administrators to oversee the entire lottery process seamlessly.

## Use Case

**Type:** School Project  
This project addresses inefficiencies in a school’s existing room allocation system by introducing a fairer, more transparent process, ensuring that each student's needs and achievements are considered in the lottery selection.

## Features

- **User Registration & Authentication:** Secure user login and registration with JWT-based authentication.
- **Admin Dashboard:** Admins can create, update, and manage lotteries, view applicants, and select winners.
- **Room Preferences:** Students can choose their preferred room type (single, double, suite) when entering a lottery.
- **Automated Winner Selection:** Automatically prioritizes winners based on academic and athletic status.
- **Multiple Room Types:** Supports various room types with separate applicant limits for each lottery.
- **Responsive Design:** Fully responsive layout optimized for mobile, tablet, and desktop views.
- **Error Handling:** Comprehensive validation and error handling to ensure a smooth user experience.

## Backstory

This project was initiated to address the shortcomings of the school's previous room allocation system, which often assigned students to the wrong rooms or failed to prioritize honors students and athletes correctly. This new system resolves those issues while introducing greater equity in room allocation.

## Technologies Used

- **Frontend:** React.js, CSS, HTML
- **Backend:** Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Authentication:** JWT (JSON Web Token)
- **Deployment:** Docker, Nginx, VPS (Virtual Private Server)
- **Database:** PostgreSQL with Sequelize ORM

## Live Demo & Repository

- [GitHub Repository](https://github.com/braydenalex/roomlottery)
- [Live Demo](https://roomlottery.braydenseaman.com)

## License

This project is licensed under the MIT License
