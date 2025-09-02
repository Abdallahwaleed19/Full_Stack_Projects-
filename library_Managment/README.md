# Library Management System - User Guide

Welcome to the Library Management System! This guide will help you navigate through the application and make the most of its features.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Installation](#installation-steps)
3. [Running the Application](#running-the-application)
4. [User Features](#user-features)
5. [Troubleshooting](#troubleshooting-installation)
6. [System Requirements](#system-requirements)
7. [Support](#support)

## Getting Started

### Prerequisites
- Visual Studio Code (VS Code) installed on your computer
- Python 3.8 or higher installed
- Git (optional, for version control)
- Administrator privileges (required for installation)
- Stable internet connection

### Required VS Code Extensions
- Python (Microsoft)
- Python Extension Pack (recommended)
- Git (optional)
- Pylance (recommended for better Python support)

### Installation Steps

1. **Download and Extract**
   - Download the library management system files
   - Extract the files to a location of your choice
   - Make sure the path doesn't contain special characters or spaces
   - The project should contain these main files:
     - `app.py` (main application file)
     - `install_packages.bat` (package installer)
     - `config.py` (configuration settings)
     - `models.py` (database models)
     - `templates/` (HTML templates)
     - `static/` (static files)

2. **Open in VS Code**
   - Open VS Code
   - Go to File → Open Folder
   - Navigate to and select the extracted folder
   - Click "Select Folder"
   - Wait for VS Code to load the project

3. **Install Dependencies**
   - In the project folder, you'll find `install_packages.bat`
   - Double-click `install_packages.bat` to run it
   - This will install all required packages:
     - Flask 3.0.2
     - Flask-SQLAlchemy 3.1.1
     - Flask-Login 0.6.3
     - Flask-Mail 0.9.1
     - Flask-WTF 1.2.1
     - Flask-Migrate 4.0.5
     - And other dependencies
   - Wait for the installation to complete
   - If you see any security warnings, click "Run anyway"

4. **Database Setup**
   - The system uses SQLite database (`library.db`)
   - Initial database setup is handled automatically
   - If you need to reset the database:
     - Run `python init_db.py`
     - This will create a fresh database with initial data

5. **Verify Installation**
   - Open VS Code's terminal (View → Terminal)
   - You should see a new terminal window
   - Run these commands to verify:
     ```bash
     python --version
     pip list
     ```
   - Check that all required packages are installed

### Running the Application

1. **Start the Application**
   - In VS Code's terminal, type: `python app.py`
   - Wait for the message indicating the server has started
   - The application will be available at: `http://localhost:5000`

2. **Access the Application**
   - Open your web browser
   - Enter the URL: `http://localhost:5000`
   - You should see the library management system login page

3. **First-Time Setup**
   - Create an admin account when prompted
   - Set up your library preferences
   - Configure email settings (if needed)
   - Add initial book categories

## User Features

### For Library Members

1. **Borrowing Books**
   - Log in to your account
   - Search for available books
   - Select the book you want to borrow
   - Click on "Borrow" button
   - Confirm your borrowing request
   - Receive confirmation email (if configured)

2. **Returning Books**
   - Log in to your account
   - Go to "My Borrowed Books" section
   - Select the book you want to return
   - Click on "Return" button
   - Confirm your return
   - Check for any late fees

3. **Book Search**
   - Use the search bar to find books
   - Filter by:
     - Title
     - Author
     - Category
     - Availability status
     - Publication date
     - ISBN
   - Save favorite searches
   - Set up search alerts

4. **Account Management**
   - View your borrowing history
   - Check due dates
   - Update personal information
   - Change password
   - Set up email notifications
   - Manage reading preferences

### For Library Staff

1. **Book Management**
   - Add new books to the system
   - Update book information
   - Remove books from the system
   - Manage book categories
   - Track book locations
   - Generate book reports

2. **Member Management**
   - Register new members
   - Update member information
   - View member borrowing history
   - Manage member accounts
   - Process membership renewals
   - Handle member queries

3. **Borrowing Management**
   - Process book borrowing requests
   - Handle book returns
   - Manage late returns
   - Generate reports
   - Track overdue books
   - Process fines

## Important Notes

- Books can be borrowed for a maximum of 14 days
- Late returns may result in fines
- Keep your login credentials secure
- Report any issues to library staff
- Regular backups are recommended
- Keep the system updated

## Troubleshooting Installation

If you encounter any issues during installation:

1. **Package Installation Fails**
   - Make sure you have administrator privileges
   - Try running `install_packages.bat` as administrator
   - Check your internet connection
   - Verify Python installation
   - Check disk space
   - If specific packages fail, try installing them individually:
     ```bash
     pip install Flask==3.0.2
     pip install Flask-SQLAlchemy==3.1.1
     # etc.
     ```

2. **VS Code Terminal Issues**
   - If the terminal doesn't open:
     - Press `Ctrl + Shift + P`
     - Type "Terminal: Create New Terminal"
     - Press Enter
   - If terminal shows errors:
     - Check Python path
     - Verify virtual environment
     - Restart VS Code

3. **Python Not Found**
   - Make sure Python is installed
   - Add Python to your system's PATH
   - Restart VS Code after making changes
   - Check Python version compatibility

4. **Virtual Environment Issues**
   - If you get "python not found" in venv:
     - Delete the existing venv folder
     - Create a new virtual environment using the correct Python version
     - Make sure to activate the virtual environment before installing packages
   - If packages fail to install:
     - Update pip: `python -m pip install --upgrade pip`
     - Try installing packages one by one
     - Check for compatibility issues with your Python version
   - If virtual environment activation fails:
     - Check system permissions
     - Verify Python installation
     - Try creating venv in a different location

5. **Database Issues**
   - Check database connection settings in `config.py`
   - Verify database file permissions
   - Ensure sufficient disk space
   - Check for database corruption
   - If needed, reset the database:
     ```bash
     python init_db.py
     ```

6. **Application Errors**
   - Check the `logs/` directory for error logs
   - Verify all required files are present
   - Check file permissions
   - Ensure all dependencies are installed
   - Verify email settings if using email features

## System Requirements

- Operating System: Windows 10 or later
- Python 3.8 or higher
- Visual Studio Code (latest version recommended)
- Internet connection for online features
- Minimum 4GB RAM
- 500MB free disk space
- Administrator privileges (for installation)
- Modern web browser (Chrome, Firefox, Edge recommended)

## Support

If you encounter any issues or need assistance:
1. Check this guide for common solutions
2. Contact library staff
3. Visit the help desk during library hours
4. For technical support, email: support@library.com
5. Check the FAQ section on our website
6. Join our user community forum

## Regular Maintenance

1. **Daily Tasks**
   - Check system logs in the `logs/` directory
   - Monitor disk space
   - Verify backups
   - Check for updates

2. **Weekly Tasks**
   - Review system performance
   - Clean temporary files
   - Update security patches
   - Generate weekly reports

3. **Monthly Tasks**
   - Full system backup
   - Performance optimization
   - Security audit
   - Update documentation

---

For any additional questions or support, please contact the library staff or visit our help desk. 