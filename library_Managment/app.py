from flask import Flask, render_template, request, redirect, url_for, flash, session as flask_session, current_app, g, Response, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from config import Config
from flask_migrate import Migrate
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
from threading import Thread
from models import db, User, LibraryBranch, Book, LibraryCard, BorrowRecord, BookSale, Notification, Activity
from flask_mail import Mail, Message
from typing import cast, Optional, Any, Union, TypeVar, List, Protocol, NoReturn, Callable
from sqlalchemy import create_engine, text, desc, and_, Column, String, Integer, Boolean, DateTime, ForeignKey, func, or_
from sqlalchemy.orm import Session, scoped_session, sessionmaker, relationship, Query
from sqlalchemy.sql.expression import or_
from werkzeug.wrappers import Response as WerkzeugResponse
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.declarative import declarative_base
import logging
from logging.handlers import RotatingFileHandler
from flask import Response as FlaskResponse
from sqlalchemy.orm.session import Session as SQLAlchemySession
from sqlalchemy.orm.decl_api import DeclarativeMeta
from flask.typing import ResponseReturnValue
from functools import wraps
from flask_wtf.csrf import CSRFProtect

# Initialize Flask app
app = Flask(__name__,
    static_folder='static',
    static_url_path='/static',
    template_folder='templates'
)
app.config.from_object(Config)

# Initialize CSRF protection
csrf = CSRFProtect(app)

# Initialize SQLAlchemy
db.init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login' # type: ignore

# Initialize Flask-Mail
mail = Mail(app)

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Add debug logging for email configuration
app.logger.info(f"Email Configuration: Server={app.config['MAIL_SERVER']}, Port={app.config['MAIL_PORT']}, Username={app.config['MAIL_USERNAME']}")
if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
    app.logger.error("Email credentials not configured properly")

# Create database tables
with app.app_context():
    try:
        # Create all tables if they don't exist
        db.create_all()
        
        # Check if we need to create initial data
        if not LibraryBranch.query.first():
            # Create a main branch
            main_branch = LibraryBranch(
                name='Main Branch',
                location='123 Library Street',
                phone='555-0123',
                email='main@library.com',
                opening_hours='9:00 AM - 9:00 PM'
            )
            db.session.add(main_branch) # type: ignore
            db.session.commit() # type: ignore
            
            # Create admin user
            admin = User(
                username='admin',
                email='admin@library.com',
                role='admin',
                full_name='System Administrator',
                branch_id=main_branch.id,
                is_verified=True  # Admin is automatically verified
            )
            admin.set_password('admin123')
            db.session.add(admin) # type: ignore
            db.session.commit() # type: ignore
            print("Database initialized with admin user")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.session.rollback() # type: ignore
        raise

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('You must be an admin to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@login_manager.user_loader
def load_user(user_id: str) -> Optional[User]:
    """Load user by ID."""
    try:
        return User.query.get(int(user_id))
    except Exception as e:
        app.logger.error(f"Error loading user: {str(e)}")
        return None

@app.before_request
def before_request():
    """Set up database session before each request"""
    g.db_session = db.session

@app.teardown_request
def teardown_request(exception=None):
    """Clean up database session after each request"""
    db_session = getattr(g, 'db_session', None)
    if db_session is not None:
        try:
            if exception is None:
                db_session.commit()
            else:
                db_session.rollback()
        finally:
            db_session.close()
    return Response(status=200)  # Return an empty response

# Type aliases for better type hints
TeardownCallable = Callable[[Optional[BaseException]], Optional[FlaskResponse]]

# Configure upload folder
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
UPLOAD_PATH = os.path.join(basedir, 'static', 'uploads')
if not os.path.exists(UPLOAD_PATH):
    os.makedirs(UPLOAD_PATH)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Type variables for ORM models
T = TypeVar('T')

@app.before_first_request
def create_tables():
    """Create all database tables"""
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        db.session.rollback() # type: ignore
        raise

def create_sample_data():
    """Create sample data for testing"""
    try:
        # Check if we already have books
        if Book.query.count() == 0:
            # Create sample books
            sample_books = [
                Book(
                    title="The Great Gatsby",
                    author="F. Scott Fitzgerald",
                    isbn="9780743273565",
                    price=9.99,
                    quantity=5,
                    description="A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan."
                ),
                Book(
                    title="To Kill a Mockingbird",
                    author="Harper Lee",
                    isbn="9780446310789",
                    price=12.99,
                    quantity=3,
                    description="The story of racial injustice and the loss of innocence in the American South."
                ),
                Book(
                    title="1984",
                    author="George Orwell",
                    isbn="9780451524935",
                    price=11.99,
                    quantity=4,
                    description="A dystopian social science fiction novel and cautionary tale."
                )
            ]
            for book in sample_books:
                db.session.add(book) # type: ignore
            db.session.commit() # type: ignore
            print("Sample books created successfully")
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.session.rollback() # type: ignore
        raise

def init_db():
    """Initialize the database and create tables"""
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
            create_sample_data()
        except Exception as e:
            print(f"Error creating database tables: {e}")
            g.db_session.rollback()
            raise

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    try:
        # Add more detailed logging
        app.logger.info("Accessing index route")
        
        # Query books with more detailed error handling
        try:
            # Use g.db_session instead of Book.query
            books = g.db_session.query(Book).order_by(desc(Book.id)).all()
            app.logger.info(f"Found {len(books)} books")
            
            # Log each book's details
            for book in books:
                app.logger.info(f"Book: {book.title} by {book.author}, Available: {book.available_quantity}/{book.quantity}")
                
            # Ensure available_quantity is set correctly
            for book in books:
                if book.available_quantity is None:
                    book.available_quantity = book.quantity
                    app.logger.warning(f"Fixed missing available_quantity for book: {book.title}")
            
            # Commit any changes using g.db_session
            g.db_session.commit()
            
            # Render template with explicit context
            return render_template('index.html', books=books, debug=True)
        except Exception as db_error:
            app.logger.error(f"Database error in index route: {str(db_error)}")
            return render_template('index.html', books=[], error=str(db_error), debug=True)
            
    except Exception as e:
        app.logger.error(f"Error in index route: {str(e)}")
        return render_template('index.html', books=[], error=str(e), debug=True)

@app.route('/test-static')
def test_static():
    """Test route to verify static files are being served correctly"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Static Files Test</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    </head>
    <body>
        <div class="container mt-5">
            <h1>Static Files Test</h1>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">CSS Test</h5>
                            <p class="card-text">If this text is styled, CSS is working.</p>
                            <button class="btn btn-primary">Test Button</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Images Test</h5>
                            <img src="{{ url_for('static', filename='images/logo.svg') }}" alt="Logo" style="max-width: 200px;">
                            <p class="mt-3">If you see the logo above, images are working.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <a href="{{ url_for('index') }}" class="btn btn-secondary">Back to Home</a>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="{{ url_for('static', filename='js/main.js') }}"></script>
    </body>
    </html>
    """

@app.route('/db-test')
def db_test():
    """Test route to verify database connection and display results"""
    try:
        # Test database connection
        db_status = "Connected"
        try:
            # Try to execute a simple query
            g.db_session.query(Book).first()
        except Exception as e:
            db_status = f"Error: {str(e)}"
        
        # Get counts of each model
        user_count = g.db_session.query(User).count()
        book_count = g.db_session.query(Book).count()
        branch_count = g.db_session.query(LibraryBranch).count()
        card_count = g.db_session.query(LibraryCard).count()
        borrow_count = g.db_session.query(BorrowRecord).count()
        sale_count = g.db_session.query(BookSale).count()
        notification_count = g.db_session.query(Notification).count()
        
        # Get sample data
        books = g.db_session.query(Book).limit(5).all()
        users = g.db_session.query(User).limit(5).all()
        
        return render_template('db_test.html', 
                              db_status=db_status,
                              user_count=user_count,
                              book_count=book_count,
                              branch_count=branch_count,
                              card_count=card_count,
                              borrow_count=borrow_count,
                              sale_count=sale_count,
                              notification_count=notification_count,
                              books=books,
                              users=users)
    except Exception as e:
        return f"Error testing database: {str(e)}"

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember', False)
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            if not user.is_verified:
                flash('Please verify your email before logging in.', 'error')
                return redirect(url_for('login'))
            
            login_user(user, remember=remember) # type: ignore
            user.last_login = datetime.utcnow()
            db.session.commit() # type: ignore
            
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        role = request.form.get('role')
        security_question = request.form.get('security_question')
        security_answer = request.form.get('security_answer')
        branch_id = request.form.get('branch_id') if role == 'librarian' else None
        
        # Check if passwords match
        if password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('register'))
        
        # Check if username or email already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists!', 'error')
            return redirect(url_for('register'))
        if User.query.filter_by(email=email).first():
            flash('Email already exists!', 'error')
            return redirect(url_for('register'))
        
        # Generate verification token
        verification_token = secrets.token_urlsafe(32)
        verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        
        # Create new user
        user = User(
            username=username,
            email=email,
            role=role,
            security_question=security_question,
            security_answer=security_answer,
            branch_id=branch_id,
            verification_token=verification_token,
            verification_token_expires=verification_token_expires
        )
        user.set_password(password) # type: ignore
        
        try:
            db.session.add(user) # type: ignore
            db.session.commit() # type: ignore
            
            # Send verification email
            verification_url = url_for('verify_email', token=verification_token, _external=True)
            msg = Message('Verify Your Email - Library Management System',
                        recipients=[email]) # type: ignore
            msg.html = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Welcome to the Library Management System!</h2>
                <p>You have been added as a librarian by the system administrator.</p>
                <p>Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background-color: #4CAF50; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-size: 16px;
                              margin: 10px 0;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{verification_url}</p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you did not expect this email, please contact the system administrator.</p>
            </div>
            '''
            mail.send(msg)
            
            flash('Registration successful! Please check your email to verify your account.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            db.session.rollback() # type: ignore
            app.logger.error(f"Error during registration: {str(e)}")
            flash('An error occurred during registration. Please try again.', 'error')
            return redirect(url_for('register'))
    
    branches = LibraryBranch.query.all()
    return render_template('register.html', branches=branches)

@app.route('/verify-email/<token>')
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        flash('Invalid or expired verification link.', 'error')
        return redirect(url_for('login'))
    
    if user.verification_token_expires < datetime.utcnow():
        flash('Verification link has expired. Please request a new one.', 'error')
        return redirect(url_for('login'))
    
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    
    try:
        db.session.commit() # type: ignore
        flash('Email verified successfully! You can now log in.', 'success')
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error verifying email: {str(e)}")
        flash('An error occurred while verifying your email.', 'error')
    
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Handle the dashboard route for different user roles"""
    try:
        if not current_user.is_authenticated:
            app.logger.error("Unauthenticated user attempting to access dashboard")
            flash('Please log in to access the dashboard', 'error')
            return redirect(url_for('login'))

        app.logger.info(f"Accessing dashboard for user {current_user.username} with role {current_user.role}")

        if not current_user.role:
            app.logger.error(f"User {current_user.username} has no role assigned")
            flash('User role not assigned. Please contact an administrator.', 'error')
            return redirect(url_for('index'))

        if current_user.role == 'admin':
            return redirect(url_for('admin_dashboard'))

        elif current_user.role == 'librarian':
            try:
                # Get librarian's branch with eager loading
                branch = db.session.query(LibraryBranch).options( # type: ignore
                    joinedload(LibraryBranch.books)
                ).get(current_user.branch_id)
                
                if not branch:
                    app.logger.error(f"Branch not found for librarian {current_user.username}")
                    # Auto-fix: unassign the branch
                    current_user.branch_id = None
                    db.session.commit() # type: ignore
                    flash('You are not assigned to any branch. Please contact an administrator.', 'error')
                    return redirect(url_for('index'))
                
                # Get branch data with efficient queries
                branch_books = db.session.query(Book).filter( # type: ignore
                    Book.branch_id == branch.id
                ).options(
                    joinedload(Book.borrow_records)
                ).all()

                active_borrows = db.session.query(BorrowRecord).join( # type: ignore
                    Book
                ).filter(
                    Book.branch_id == branch.id,
                    BorrowRecord.return_date == None
                ).options(
                    joinedload(BorrowRecord.user),
                    joinedload(BorrowRecord.book)
                ).all()

                customers = db.session.query(User).filter( # type: ignore
                    User.role == 'customer'
                ).options(
                    joinedload(User.library_cards)
                ).all()

                app.logger.info(f"Librarian dashboard data loaded for branch {branch.name}")
                return render_template('librarian_dashboard.html',
                                    books=branch_books,
                                    borrow_records=active_borrows,
                                    branch=branch,
                                    customers=customers,
                                    current_time=datetime.utcnow())

            except Exception as db_error:
                app.logger.error(f"Librarian dashboard database error: {str(db_error)}")
                db.session.rollback() # type: ignore
                flash('Error loading librarian dashboard data. Please try again.', 'error')
                return redirect(url_for('index'))

        elif current_user.role == 'customer':
            try:
                # Get customer data with efficient eager loading
                borrowed_books = db.session.query(BorrowRecord).filter( # type: ignore
                    BorrowRecord.user_id == current_user.id,
                    BorrowRecord.return_date == None
                ).options(
                    joinedload(BorrowRecord.book).joinedload(Book.branch)
                ).all()

                library_cards = db.session.query(LibraryCard).filter( # type: ignore
                    LibraryCard.user_id == current_user.id
                ).options(
                    joinedload(LibraryCard.branch)
                ).all()

                book_sales = db.session.query(BookSale).filter( # type: ignore
                    BookSale.user_id == current_user.id
                ).options(
                    joinedload(BookSale.book)
                ).order_by(
                    BookSale.sale_date.desc()
                ).all()

                notifications = db.session.query(Notification).filter( # type: ignore
                    Notification.user_id == current_user.id,
                    Notification.is_read == False
                ).order_by(
                    Notification.created_at.desc()
                ).all()

                app.logger.info(f"Customer dashboard data loaded for {current_user.username}")
                return render_template('customer_dashboard.html',
                                    borrowed_books=borrowed_books,
                                    library_cards=library_cards,
                                    book_sales=book_sales,
                                    notifications=notifications,
                                    current_time=datetime.utcnow())

            except Exception as db_error:
                app.logger.error(f"Customer dashboard database error: {str(db_error)}")
                db.session.rollback() # type: ignore
                flash('Error loading customer dashboard data. Please try again.', 'error')
                return redirect(url_for('index'))

        else:
            app.logger.error(f"Invalid role '{current_user.role}' for user {current_user.username}")
            flash('Invalid user role', 'error')
            return redirect(url_for('index'))

    except Exception as e:
        app.logger.error(f"Critical dashboard error: {str(e)}")
        flash('Error loading dashboard. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/notifications/mark-read/<int:notification_id>', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    """Mark a single notification as read"""
    try:
        # Update the notification directly
        notification = db.session.query(Notification).filter_by( # type: ignore
            id=notification_id,
            user_id=current_user.id,
            is_read=False
        ).first()
        
        if notification:
            notification.is_read = True
            db.session.commit() # type: ignore
            flash('Notification marked as read', 'success')
        else:
            flash('Notification not found or already read', 'info')
            
    except Exception as e:
        db.session.rollback() # type: ignore
        flash('Error marking notification as read', 'error')
        print(f"Error marking notification as read: {str(e)}")
    
    return redirect(url_for('dashboard'))

@app.route('/notifications/mark-all-read', methods=['POST'])
@login_required
def mark_all_notifications_read():
    """Mark all unread notifications for the current user as read"""
    try:
        # Update all unread notifications directly
        notifications = db.session.query(Notification).filter_by( # type: ignore
            user_id=current_user.id,
            is_read=False
        ).all()
        
        count = 0
        for notification in notifications:
            notification.is_read = True
            count += 1
        
        db.session.commit() # type: ignore
        
        if count > 0:
            flash(f'{count} notification(s) marked as read', 'success')
        else:
            flash('No unread notifications found', 'info')
            
    except Exception as e:
        db.session.rollback() # type: ignore
        flash('Error marking notifications as read', 'error')
        print(f"Error marking notifications as read: {str(e)}")
    
    return redirect(url_for('dashboard'))

@app.route('/book/add', methods=['POST'])
@login_required
def add_book():
    if current_user.role != 'librarian':
        flash('Unauthorized access')
        return redirect(url_for('index'))
        
    title = request.form.get('title')
    author = request.form.get('author')
    isbn = request.form.get('isbn')
    quantity_str = request.form.get('quantity', '1')
    try:
        quantity = int(quantity_str)
    except (ValueError, TypeError):
        quantity = 1
    
    description = request.form.get('description')
    category = request.form.get('category')
    
    book = Book(
        title=title,
        author=author,
        isbn=isbn,
        quantity=quantity,
        available_quantity=quantity,
        description=description,
        category=category
    )
    db.session.add(book) # type: ignore
    db.session.commit() # type: ignore
    
    flash('Book added successfully')
    return redirect(url_for('dashboard'))

@app.route('/borrow_book/<int:book_id>', methods=['POST'])
@login_required
def borrow_book(book_id):
    try:
        # Get the book
        book = Book.query.get(book_id)
        if book is None:
            flash('Book not found', 'error')
            return redirect(url_for('dashboard'))
        # Check if book is available
        if book.quantity <= 0:
            flash('This book is currently not available for borrowing.', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        # Get user's active library card
        library_card = LibraryCard.query.filter_by(user_id=current_user.id, is_active=True).first()
        if not library_card:
            flash('You need an active library card to borrow books.', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        # Check if card is expired
        if library_card.expiry_date < datetime.now():
            flash('Your library card has expired. Please renew it.', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        # Check if user has any overdue books
        overdue_books = BorrowRecord.query.filter_by(user_id=current_user.id, is_returned=False).filter(BorrowRecord.due_date < datetime.now()).count()
        if overdue_books > 0:
            flash('You have overdue books. Please return them before borrowing new ones.', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        # Create borrow record
        borrow_date = datetime.now()
        due_date = borrow_date + timedelta(days=14)  # 2 weeks borrowing period
        borrow_record = BorrowRecord(
            book_id=book_id,
            user_id=current_user.id,
            borrow_date=borrow_date,
            due_date=due_date,
            is_returned=False
        )
        # Update book quantity
        book.quantity -= 1
        # Create notification
        notification = Notification(
            user_id=current_user.id,
            notification_type='borrow',
            message=f'You have borrowed "{book.title}". Due date: {due_date.strftime("%Y-%m-%d")}'
        )
        db.session.add(borrow_record) # type: ignore
        db.session.add(notification) # type: ignore
        db.session.commit() # type: ignore
        flash(f'Successfully borrowed "{book.title}". Please return by {due_date.strftime("%Y-%m-%d")}.', 'success')
        return redirect(url_for('dashboard'))
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Exception in borrow_book for id {book_id}: {str(e)}\n{tb}")
        db.session.rollback() # type: ignore
        flash('An error occurred while processing your request.', 'error')
        return redirect(url_for('book_details', book_id=book_id))

@app.route('/librarian/sell_library_card', methods=['POST'])
@login_required
def sell_library_card():
    if current_user.role != 'librarian':
        flash('Unauthorized access')
        return redirect(url_for('dashboard'))
    
    try:
        user_id = request.form.get('user_id')
        price = float(request.form.get('price', 10.0))
        
        if not user_id:
            flash('Customer selection is required')
            return redirect(url_for('dashboard'))
        
        # Get the customer
        customer = db.session.query(User).get(int(user_id)) # type: ignore
        
        # Generate unique card number
        card_number = f"LIB-{datetime.utcnow().strftime('%Y%m%d')}-{user_id}"
        expiry_date = datetime.utcnow() + timedelta(days=365)
        
        card = LibraryCard(
            user_id=int(user_id),
            price=price,
            card_number=card_number,
            expiry_date=expiry_date,
            branch_id=current_user.branch_id,
            is_active=True
        )
        
        # Create notification for the customer
        notification = Notification(
            user_id=int(user_id),
            message=f"You have been issued a new library card (Card Number: {card_number}). Valid until {expiry_date.strftime('%Y-%m-%d')}.",
            notification_type='library_card'
        )
        
        # Send email notification if email configuration is available
        if app.config.get('MAIL_USERNAME') and app.config.get('MAIL_PASSWORD'):
            try:
                msg = MIMEMultipart()
                sender = app.config.get('MAIL_DEFAULT_SENDER', 'library@example.com')
                msg['From'] = sender
                msg['To'] = customer.email
                msg['Subject'] = 'New Library Card Issued'
                
                email_body = f"""
                Dear {customer.username},
                
                Your new library card has been issued successfully!
                
                Card Details:
                - Card Number: {card_number}
                - Issue Date: {datetime.utcnow().strftime('%Y-%m-%d')}
                - Expiry Date: {expiry_date.strftime('%Y-%m-%d')}
                - Price: ${price:.2f}
                
                You can use this card to borrow books from our library. Please keep this information for your records.
                
                Best regards,
                Library Management Team
                """
                
                msg.attach(MIMEText(email_body, 'plain'))
                
                # Configure and send email
                with smtplib.SMTP(app.config.get('MAIL_SERVER'),  # type: ignore
                                int(app.config.get('MAIL_PORT', 587))) as server:
                    server.starttls()
                    username = str(app.config.get('MAIL_USERNAME'))
                    password = str(app.config.get('MAIL_PASSWORD'))
                    if username and password:
                        server.login(username, password)
                        server.send_message(msg)
                        print(f"Email sent successfully to {customer.email}")
                    else:
                        print("Email credentials not configured")
            
            except Exception as e:
                print(f"Email error: {str(e)}")
                # Continue with card creation even if email fails
        
        # Save to database
        db.session.add(card) # type: ignore
        db.session.add(notification) # type: ignore
        db.session.commit() # type: ignore
        
        flash('Library card issued successfully')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        flash('Error issuing library card')
        print(f"Error: {str(e)}")
    
    return redirect(url_for('dashboard'))

@app.route('/book/<int:book_id>')
def book_details(book_id):
    try:
        book = Book.query.get(book_id)
        if book is None:
            app.logger.error(f"Book details error: Book with id {book_id} not found.")
            flash('Book not found', 'error')
            return redirect(url_for('dashboard'))
        return render_template('book_details.html', book=book)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Exception in book_details for id {book_id}: {str(e)}\n{tb}")
        flash('Error retrieving book details', 'error')
        return redirect(url_for('dashboard'))

@app.route('/book/<int:book_id>/buy', methods=['POST'])
@login_required
def buy_book(book_id: int) -> ResponseReturnValue:
    """Purchase a book"""
    try:
        book = Book.query.get(book_id)
        if not book:
            flash('Book not found', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        quantity_str = request.form.get('quantity', '1')
        try:
            quantity = int(quantity_str)
            if quantity <= 0:
                quantity = 1
        except (ValueError, TypeError):
            quantity = 1
        if quantity > book.quantity:
            flash('Not enough books in stock', 'error')
            return redirect(url_for('book_details', book_id=book_id))
        sale = BookSale(
            book_id=book.id,
            user_id=current_user.id,
            quantity=quantity,
            price=book.price * quantity,
            sale_date=datetime.utcnow()
        )
        book.quantity -= quantity
        try:
            db.session.add(sale) # type: ignore
            db.session.commit() # type: ignore
            flash(f'Successfully purchased {quantity} book(s)', 'success')
            # Send notification
            send_notification(
                current_user.id,
                f'You have successfully purchased {quantity} copy/copies of {book.title}',
                'purchase'
            )
            return redirect(url_for('dashboard'))
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            app.logger.error(f"Error during book purchase for id {book_id}: {str(e)}\n{tb}")
            db.session.rollback() # type: ignore
            flash('Error processing purchase', 'error')
            return redirect(url_for('book_details', book_id=book_id))
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Error in buy_book for id {book_id}: {str(e)}\n{tb}")
        flash('Error processing request', 'error')
        return redirect(url_for('index'))

@app.route('/admin/card/deactivate/<int:card_id>', methods=['POST'])
@login_required
def admin_deactivate_card(card_id):
    if current_user.role != 'admin':
        flash('Unauthorized access')
        return redirect(url_for('dashboard'))
    
    try:
        # Get the card within this session
        card = db.session.query(LibraryCard).get(card_id) # type: ignore
        if not card:
            flash('Library card not found')
            return redirect(url_for('dashboard'))
            
        # Check if card is already inactive
        if not card.is_active:
            flash('Library card is already inactive')
            return redirect(url_for('dashboard'))
            
        # Deactivate the card
        card.is_active = False
        
        # Create notification for the user
        notification = Notification(
            user_id=card.user_id,
            notification_type='library_card',
            message=f'Your library card (Card #{card.card_number}) has been deactivated.'
        )
        db.session.add(notification) # type: ignore
        
        # Commit changes
        db.session.commit() # type: ignore
        flash('Library card deactivated successfully')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        print(f"Error deactivating card: {str(e)}")
        flash('Error deactivating library card')
    
    return redirect(url_for('dashboard'))

@app.route('/admin/card/delete/<int:card_id>', methods=['POST'])
@login_required
def admin_delete_card(card_id):
    try:
        # Verify admin privileges
        if not current_user.role == 'admin':
            flash('You do not have permission to perform this action.', 'error')
            return redirect(url_for('dashboard'))
            
        card = db.session.query(LibraryCard).get(card_id) # type: ignore
        if card is None:
            flash('Library card not found', 'error')
            return redirect(url_for('dashboard'))
            
        # Check if card has any active borrows
        active_borrows = db.session.query(BorrowRecord).filter_by( # type: ignore
            library_card_id=card_id,
            return_date=None
        ).first()
        
        if active_borrows:
            flash('Cannot deactivate card with active borrows. Please return all books first.', 'error')
            return redirect(url_for('dashboard'))
            
        card.is_active = False
        db.session.commit() # type: ignore
        
        flash('Library card has been deactivated successfully.', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        flash('An error occurred while deactivating the card.', 'error')
        app.logger.error(f"Error deactivating card {card_id}: {str(e)}")
        
    return redirect(url_for('dashboard'))

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        user = db.session.query(User).filter_by(email=email).first() # type: ignore
        
        if user:
            try:
                # Generate reset token
                reset_token = secrets.token_urlsafe(32)
                user.reset_token = reset_token
                user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
                db.session.commit() # type: ignore
                
                # Send reset email using Flask-Mail
                reset_link = url_for('reset_password', token=reset_token, _external=True)
                msg = Message(
                    'Password Reset Request',
                    sender=app.config['MAIL_DEFAULT_SENDER'],
                    recipients=[user.email]
                )
                msg.body = f"""
                Hello {user.username},
                
                You requested a password reset. Click the link below to reset your password:
                {reset_link}
                
                This link will expire in 1 hour.
                
                If you didn't request this, please ignore this email.
                
                Best regards,
                Library Management System Team
                """
                
                # Send email in a try-except block with detailed error handling
                try:
                    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
                        raise ValueError("Email credentials not configured. Please set MAIL_USERNAME and MAIL_PASSWORD environment variables.")
                    
                    if not app.config['MAIL_DEFAULT_SENDER']:
                        raise ValueError("Default sender email not configured. Please set MAIL_DEFAULT_SENDER environment variable.")
                    
                    app.logger.info(f"Attempting to send email to {user.email}")
                    mail.send(msg)
                    app.logger.info(f"Password reset email sent successfully to {user.email}")
                    flash('Password reset link has been sent to your email.', 'success')
                    return redirect(url_for('login'))
                except Exception as mail_error:
                    app.logger.error(f"Error sending reset email: {str(mail_error)}")
                    app.logger.error(f"Email configuration: MAIL_USERNAME={app.config['MAIL_USERNAME']}, MAIL_DEFAULT_SENDER={app.config['MAIL_DEFAULT_SENDER']}")
                    # Rollback the token generation if email fails
                    db.session.rollback() # type: ignore
                    flash(f'Error sending reset email: {str(mail_error)}', 'error')
                    return redirect(url_for('forgot_password'))
                    
            except Exception as e:
                app.logger.error(f"Error in password reset process: {str(e)}")
                db.session.rollback() # type: ignore
                flash('An error occurred. Please try again later.', 'error')
                return redirect(url_for('forgot_password'))
        
        flash('Email not found.', 'error')
        return redirect(url_for('forgot_password'))
    
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    user = db.session.query(User).filter_by(reset_token=token).first() # type: ignore
    
    if not user or user.reset_token_expiry < datetime.utcnow():
        flash('Invalid or expired reset link.')
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not password or password != confirm_password:
            flash('Passwords do not match or are empty.')
            return redirect(url_for('reset_password', token=token))
        
        try:
            user.set_password(password)
            user.reset_token = None
            user.reset_token_expiry = None
            db.session.commit() # type: ignore
            
            flash('Password has been reset successfully.')
            return redirect(url_for('login'))
        except Exception as e:
            session.rollback() # type: ignore
            app.logger.error(f"Password reset error: {str(e)}")
            flash('Error resetting password. Please try again.')
            return redirect(url_for('reset_password', token=token))
    
    return render_template('reset_password.html', token=token)

@app.route('/admin/branch/edit/<int:branch_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_branch(branch_id):
    """Edit a library branch"""
    branch = db.session.query(LibraryBranch).get(branch_id) # type: ignore
    if branch is None:
        flash('Branch not found', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        branch.name = request.form.get('name')
        branch.location = request.form.get('location')
        branch.phone = request.form.get('phone')
        db.session.commit() # type: ignore
        flash('Branch updated successfully')
        return redirect(url_for('dashboard'))

    # On GET, render the edit form
    return render_template('edit_branch.html', branch=branch)

@app.route('/admin/book/edit/<int:book_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_book(book_id):
    book = db.session.query(Book).get(book_id) # type: ignore
    if book is None:
        flash('Book not found', 'error')
        return redirect(url_for('dashboard'))
    branches = db.session.query(LibraryBranch).all() # type: ignore
    if request.method == 'POST':
        book.title = request.form.get('title')
        book.author = request.form.get('author')
        book.isbn = request.form.get('isbn')
        book.branch_id = int(request.form.get('branch_id')) # type: ignore
        book.quantity = int(request.form.get('quantity', 1))
        book.price = float(request.form.get('price', 0.0))
        book.category = request.form.get('category')
        book.description = request.form.get('description')
        # Handle cover image upload if needed...
        db.session.commit() # type: ignore
        flash('Book updated successfully')
        return redirect(url_for('dashboard'))
    return render_template('edit_book.html', book=book, branches=branches)

@app.route('/admin/librarian/edit/<int:user_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_librarian(user_id):
    librarian = db.session.query(User).get(user_id) # type: ignore
    if librarian is None:
        flash('Librarian not found', 'error')
        return redirect(url_for('dashboard'))

    branches = db.session.query(LibraryBranch).all() # type: ignore

    if request.method == 'POST':
        librarian.username = request.form.get('username')
        librarian.email = request.form.get('email')
        librarian.branch_id = int(request.form.get('branch_id')) # type: ignore
        # Update password if provided
        new_password = request.form.get('new_password')
        if new_password:
            librarian.set_password(new_password)
        db.session.commit() # type: ignore
        flash('Librarian updated successfully')
        return redirect(url_for('dashboard'))

    # On GET, render the edit form
    return render_template('edit_librarian.html', librarian=librarian, branches=branches)

@app.route('/admin/customer/edit/<int:user_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_customer(user_id):
    customer = db.session.query(User).get(user_id) # type: ignore
    if customer is None:
        flash('Customer not found', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        customer.username = request.form.get('username')
        customer.email = request.form.get('email')
        # Update password if provided
        new_password = request.form.get('new_password')
        if new_password:
            customer.set_password(new_password)
        db.session.commit() # type: ignore
        flash('Customer updated successfully')
        return redirect(url_for('dashboard'))

    # On GET, render the edit form
    return render_template('edit_customer.html', customer=customer)

@app.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    try:
        user = db.session.query(User).get(current_user.id) # type: ignore
        if not user:
            flash('User not found', 'error')
            return redirect(url_for('dashboard'))

        # Handle new photo upload
        if 'profile_photo' in request.files:
            photo = request.files['profile_photo']
            if photo and photo.filename and allowed_file(photo.filename):
                try:
                    # Delete old photo if it exists
                    if user.profile_photo:
                        old_photo_path = os.path.join(app.root_path, 'static', user.profile_photo)
                        if os.path.exists(old_photo_path):
                            os.remove(old_photo_path)
                    
                    # Generate unique filename
                    filename = secure_filename(photo.filename)
                    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
                    unique_filename = f"{timestamp}_{filename}"
                    
                    # Ensure the upload directory exists
                    profile_upload_dir = os.path.join(app.root_path, 'static', 'uploads', 'profiles')
                    os.makedirs(profile_upload_dir, exist_ok=True)
                    
                    # Save the file
                    photo_path = os.path.join('uploads', 'profiles', unique_filename)
                    full_path = os.path.join(app.root_path, 'static', photo_path)
                    photo.save(full_path)
                    
                    # Update database with relative path
                    user.profile_photo = photo_path.replace('\\', '/')
                except Exception as e:
                    print(f"Error handling profile photo: {str(e)}")
                    flash('Error uploading profile photo', 'error')
                    return redirect(url_for('view_profile', user_id=current_user.id))
        
        # Update other fields
        user.full_name = request.form.get('full_name')
        user.phone = request.form.get('phone')
        user.address = request.form.get('address')
        user.bio = request.form.get('bio')
        
        db.session.commit() # type: ignore
        flash('Profile updated successfully', 'success')
    except Exception as e:
        db.session.rollback() # type: ignore
        print(f"Error updating profile: {str(e)}")
        flash('Error updating profile', 'error')
    
    return redirect(url_for('view_profile', user_id=current_user.id))

@app.route('/profile/<int:user_id>')
@login_required
def view_profile(user_id):
    try:
        # Load user with all necessary relationships
        user = User.query.options(
            joinedload(User.library_cards).joinedload(LibraryCard.branch),
            joinedload(User.borrow_records).joinedload(BorrowRecord.book).joinedload(Book.branch),
            joinedload(User.book_sales).joinedload(BookSale.book)
        ).get(user_id)
        
        if user is None:
            app.logger.error(f"User {user_id} not found")
            flash('User not found', 'error')
            return redirect(url_for('dashboard'))
            
        current_time = datetime.utcnow()
        app.logger.info(f"Loading profile for user {user.username} with role {user.role}")

        if user.role == 'customer':
            app.logger.info("Loading customer profile data")
            return render_template('customer_profile.html', 
                                user=user,
                                current_user=user,
                                current_time=current_time)
        elif user.role == 'librarian':
            app.logger.info("Loading librarian profile data")
            # Get librarian statistics
            statistics = {
                'books_managed': Book.query.filter_by(branch_id=user.branch_id).count(),
                'cards_issued': LibraryCard.query.filter_by(branch_id=user.branch_id).count(),
                'books_returned': BorrowRecord.query.join(Book).filter(
                    Book.branch_id == user.branch_id,
                    BorrowRecord.is_returned == True
                ).count()
            }
            
            # Get recent activities (last 10)
            recent_activities = []
            
            # Get recent book returns
            returns = BorrowRecord.query.join(Book).filter(
                Book.branch_id == user.branch_id,
                BorrowRecord.is_returned == True
            ).order_by(desc(BorrowRecord.return_date)).limit(10).all()
            
            for record in returns:
                recent_activities.append({
                    'date': record.return_date,
                    'action': 'Book Return',
                    'details': f'"{record.book.title}" returned by {record.user.username}'
                })
            
            # Get recent card sales
            cards = LibraryCard.query.filter_by(branch_id=user.branch_id)\
                .order_by(desc(LibraryCard.issue_date)).limit(10).all()
                
            for card in cards:
                recent_activities.append({
                    'date': card.issue_date,
                    'action': 'Card Issued',
                    'details': f'Library card issued to {card.user.username}'
                })
            
            # Sort activities by date
            recent_activities.sort(key=lambda x: x['date'], reverse=True)
            recent_activities = recent_activities[:10]  # Keep only 10 most recent
            
            return render_template('librarian_profile.html',
                                user=user,
                                current_user=user,
                                statistics=statistics,
                                current_time=current_time,
                                recent_activities=recent_activities)
        else:  # admin
            app.logger.info("Loading admin profile data")
            # Get system statistics
            branches = LibraryBranch.query.all()
            librarians = User.query.filter_by(role='librarian').all()
            books = Book.query.all()
            customers = User.query.filter_by(role='customer').all()
            
            # Get recent activities (last 10)
            recent_activities = []
            
            # Recent book additions
            recent_books = Book.query.order_by(desc(Book.id)).limit(5).all()
            for book in recent_books:
                recent_activities.append({
                    'date': datetime.utcnow(),  # Since we don't store creation date
                    'action': 'Book Added',
                    'details': f'"{book.title}" added to {book.branch.name}'
                })
            
            # Recent librarian registrations
            recent_librarians = User.query.filter_by(role='librarian')\
                .order_by(desc(User.date_joined)).limit(5).all()
            for librarian in recent_librarians:
                recent_activities.append({
                    'date': librarian.date_joined,
                    'action': 'Librarian Added',
                    'details': f'{librarian.username} assigned to {librarian.branch.name if librarian.branch else "No Branch"}'
                })
            
            # Recent customer registrations
            recent_customers = User.query.filter_by(role='customer')\
                .order_by(desc(User.date_joined)).limit(5).all()
            for customer in recent_customers:
                recent_activities.append({
                    'date': customer.date_joined,
                    'action': 'Customer Registered',
                    'details': f'New customer {customer.username} registered'
                })
            
            # Sort activities by date
            recent_activities.sort(key=lambda x: x['date'], reverse=True)
            recent_activities = recent_activities[:10]  # Keep only 10 most recent
            
            return render_template('admin_profile.html',
                                user=user,
                                current_user=user,
                                branches=branches,
                                librarians=librarians,
                                books=books,
                                customers=customers,
                                current_time=current_time,
                                recent_activities=recent_activities)
    except Exception as e:
        app.logger.error(f"Error viewing profile: {str(e)}", exc_info=True)
        db.session.rollback() # type: ignore
        flash('Error loading profile', 'error')
        return redirect(url_for('dashboard'))

@app.route('/profile/delete_photo', methods=['POST'])
@login_required
def delete_profile_photo():
    try:
        if current_user.profile_photo:
            # Get the full path to the photo
            photo_path = os.path.join(app.root_path, 'static', current_user.profile_photo)
            
            # Delete the file if it exists
            if os.path.exists(photo_path):
                os.remove(photo_path)
            
            # Clear the profile_photo field in the database
            current_user.profile_photo = None
            db.session.commit() # type: ignore
            
            flash('Profile photo deleted successfully', 'success')
        else:
            flash('No profile photo to delete', 'info')
            
    except Exception as e:
        print(f"Error deleting profile photo: {str(e)}")
        flash('Error deleting profile photo', 'error')
        db.session.rollback() # type: ignore
    
    return redirect(url_for('view_profile', user_id=current_user.id))

def send_notification(user_id: int, message: str, notification_type: str, send_email: bool = True) -> bool:
    """
    Create a notification and optionally send an email to the user.
    """
    try:
        # Create notification in database
        notification = Notification(
            user_id=user_id,
            message=message,
            notification_type=notification_type,
            is_read=False
        )
        db.session.add(notification) # type: ignore
        
        # Get user email
        user = db.session.query(User).get(user_id) # type: ignore
        if not user or not user.email:
            raise ValueError("User not found or has no email address")
        
        # Send email if requested and email configuration is available
        if send_email and app.config.get('MAIL_USERNAME') and app.config.get('MAIL_PASSWORD'):
            try:
                msg = MIMEMultipart()
                sender = app.config.get('MAIL_DEFAULT_SENDER', 'library@example.com')
                msg['From'] = sender
                msg['To'] = user.email
                msg['Subject'] = f'Library Notification: {notification_type.replace("_", " ").title()}'
                
                email_body = f"""
                Dear {user.username},
                
                {message}
                
                Best regards,
                Library Management Team
                """
                
                msg.attach(MIMEText(email_body, 'plain'))
                
                # Send email using context manager
                with smtplib.SMTP(str(app.config.get('MAIL_SERVER')), 
                                int(app.config.get('MAIL_PORT', 587))) as server:
                    server.starttls()
                    username = str(app.config.get('MAIL_USERNAME'))
                    password = str(app.config.get('MAIL_PASSWORD'))
                    if username and password:
                        server.login(username, password)
                        server.send_message(msg)
                        print(f"Email sent successfully to {user.email}")
                    else:
                        print("Email credentials not configured")
            
            except Exception as e:
                print(f"Error sending email: {str(e)}")
                # Continue even if email fails
        
        db.session.commit() # type: ignore
        return True
        
    except Exception as e:
        db.session.rollback() # type: ignore
        print(f"Error creating notification: {str(e)}")
        return False

def send_due_date_reminders():
    """Send reminders for books due soon or overdue"""
    try:
        # Get all active borrow records
        active_borrows = db.session.query(BorrowRecord).filter_by(is_returned=False).all() # type: ignore
        current_time = datetime.utcnow()
        
        for borrow in active_borrows:
            days_until_due = (borrow.due_date - current_time).days
            book = db.session.query(Book).get(borrow.book_id) # type: ignore
            
            # Send reminder 2 days before due date
            if days_until_due == 2:
                message = f"""Reminder: The book "{book.title}" is due in 2 days.
Due date: {borrow.due_date.strftime('%Y-%m-%d')}
Please return it on time to avoid late fees."""
                
                send_notification(
                    user_id=borrow.user_id,
                    message=message,
                    notification_type='due_reminder'
                )
            
            # Send overdue notice
            elif days_until_due < 0:
                late_days = abs(days_until_due)
                late_fee = late_days * 0.50  # $0.50 per day
                
                message = f"""OVERDUE NOTICE: The book "{book.title}" is {late_days} days overdue.
Due date: {borrow.due_date.strftime('%Y-%m-%d')}
Current late fee: ${late_fee:.2f}
Please return the book as soon as possible to avoid additional fees."""
                
                send_notification(
                    user_id=borrow.user_id,
                    message=message,
                    notification_type='overdue_notice'
                )
    
    except Exception as e:
        print(f"Error sending due date reminders: {str(e)}")

# Schedule the reminder function to run daily
@app.before_first_request
def init_reminders():
    def run_reminders():
        with app.app_context():
            while True:
                send_due_date_reminders()
                time.sleep(86400)  # Sleep for 24 hours
    
    thread = Thread(target=run_reminders)
    thread.daemon = True
    thread.start()

@app.route('/search_books')
@login_required
def search_books():
    try:
        query = request.args.get('query', '')
        if not query:
            return redirect(url_for('dashboard'))
        
        # Search for books by title, author, or ISBN - use SQLAlchemy or_ and like
        books = db.session.query(Book).filter( # type: ignore
            or_(
                Book.title.like(f'%{query}%'),
                Book.author.like(f'%{query}%'),
                Book.isbn.like(f'%{query}%')
            )
        ).all()
        
        # Get other required data for the dashboard
        borrowed_books = db.session.query(BorrowRecord).filter_by( # type: ignore
            user_id=current_user.id,
            is_returned=False
        ).all()
        
        library_cards = db.session.query(LibraryCard).filter_by( # type: ignore
            user_id=current_user.id,
            is_active=True
        ).all()
        
        # Get purchased books - use SQLAlchemy desc() function
        book_sales = db.session.query(BookSale).filter_by( # type: ignore
            user_id=current_user.id
        ).order_by(desc(BookSale.sale_date)).all()
        
        notifications = db.session.query(Notification).filter_by( # type: ignore
            user_id=current_user.id,
            is_read=False
        ).order_by(desc(Notification.created_at)).all()
        
        return render_template('customer_dashboard.html',
                            search_results=books,
                            borrowed_books=borrowed_books,
                            library_cards=library_cards,
                            book_sales=book_sales,
                            notifications=notifications,
                            current_time=datetime.utcnow(),
                            timedelta=timedelta)
    except Exception as e:
        print(f"Error searching books: {str(e)}")
        flash('Error performing search', 'error')
        return redirect(url_for('dashboard'))

@app.route('/borrow/cancel/<int:borrow_id>', methods=['POST'])
@login_required
def cancel_borrow(borrow_id):
    try:
        # Get the borrow record
        borrow_record = db.session.query(BorrowRecord).filter_by( # type: ignore
            id=borrow_id,
            user_id=current_user.id,
            is_returned=False
        ).first()
        
        if not borrow_record:
            flash('Invalid borrow record or already returned', 'error')
            return redirect(url_for('dashboard'))
        
        # Update book quantity
        book = db.session.query(Book).get(borrow_record.book_id) # type: ignore
        if book:
            book.quantity += 1
        
        # Mark as returned and set return date
        borrow_record.is_returned = True
        borrow_record.return_date = datetime.utcnow()
        
        # Create notification
        notification = Notification(
            user_id=current_user.id,
            notification_type='borrow_cancel',
            message=f'You have canceled borrowing "{book.title}".'
        )
        db.session.add(notification) # type: ignore
        
        db.session.commit() # type: ignore
        flash('Book borrowing canceled successfully', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        print(f"Error canceling borrow: {str(e)}")
        flash('Error canceling book borrowing', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/deactivate_card/<int:card_id>', methods=['POST'])
@login_required
def deactivate_card(card_id):
    try:
        card = db.session.query(LibraryCard).get(card_id) # type: ignore
        if card is None:
            flash('Library card not found', 'error')
            return redirect(url_for('dashboard'))
            
        # Verify card belongs to current user
        if card.user_id != current_user.id:
            flash('You do not have permission to deactivate this card.', 'error')
            return redirect(url_for('dashboard'))
            
        # Check if card is already inactive
        if not card.is_active:
            flash('This card is already inactive.', 'warning')
            return redirect(url_for('dashboard'))
            
        # Check if user has any active borrows (fix: use user_id and is_returned)
        active_borrows = db.session.query(BorrowRecord).filter_by( # type: ignore
            user_id=card.user_id,
            is_returned=False
        ).first()
        
        if active_borrows:
            flash('Cannot deactivate card with active borrows. Please return all books first.', 'error')
            return redirect(url_for('dashboard'))
            
        card.is_active = False
        db.session.commit() # type: ignore
        
        flash('Library card has been deactivated successfully.', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        flash('An error occurred while deactivating the card.', 'error')
        app.logger.error(f"Error deactivating card {card_id}: {str(e)}")
        
    return redirect(url_for('dashboard'))

@app.route('/delete_card/<int:card_id>', methods=['POST'])
@login_required
def delete_card(card_id):
    try:
        card = db.session.query(LibraryCard).get(card_id) # type: ignore
        if card is None:
            flash('Library card not found', 'error')
            return redirect(url_for('dashboard'))
            
        # Verify card belongs to current user
        if card.user_id != current_user.id:
            flash('You do not have permission to delete this card.', 'error')
            return redirect(url_for('dashboard'))
            
        # Check if card has any active borrows
        active_borrows = db.session.query(BorrowRecord).filter_by( # type: ignore
            card_id=card_id,
            is_returned=False
        ).first()
        
        if active_borrows:
            flash('Cannot delete card with active borrows. Please return all books first.', 'error')
            return redirect(url_for('dashboard'))
            
        # Store card info for notification
        card_number = card.card_number
            
        # Delete the card
        db.session.delete(card) # type: ignore
        
        # Create notification
        notification = Notification(
            user_id=current_user.id,
            notification_type='library_card',
            message=f'Your library card (Card #{card_number}) has been deleted.'
        )
        db.session.add(notification) # type: ignore
        
        # Commit changes
        db.session.commit() # type: ignore
        flash('Library card has been deleted successfully.', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error deleting card {card_id}: {str(e)}")
        flash('An error occurred while deleting the card.', 'error')
        
    return redirect(url_for('dashboard'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin/<string:type>/delete/<int:id>', methods=['POST'])
@login_required
def admin_delete_item(type, id):
    """Delete a branch, librarian, book, or customer"""
    success = False
    message = ''
    try:
        if type == 'branch':
            item = db.session.query(LibraryBranch).get(id) # type: ignore
            if item:
                # First, update all books to remove branch association
                books = db.session.query(Book).filter_by(branch_id=id).all() # type: ignore
                for book in books:
                    book.branch_id = None
                # Then, update all librarians to remove branch association
                librarians = db.session.query(User).filter_by(branch_id=id, role='librarian').all() # type: ignore
                for librarian in librarians:
                    librarian.branch_id = None
                db.session.delete(item) # type: ignore
                db.session.commit() # type: ignore
                success = True
                message = 'Branch deleted successfully. Associated books and librarians have been unassigned.'
            else:
                message = 'Branch not found'
        elif type == 'librarian':
            item = db.session.query(User).filter_by(id=id, role='librarian').first() # type: ignore
            if item:
                db.session.delete(item) # type: ignore
                db.session.commit() # type: ignore
                success = True
                message = 'Librarian deleted successfully'
            else:
                message = 'Librarian not found'
        elif type == 'book':
            item = db.session.query(Book).get(id) # type: ignore
            if item:
                if item.borrow_records:
                    message = 'Cannot delete book with borrow records'
                    if request.headers.get('Content-Type') == 'application/json':
                        return jsonify({'success': False, 'error': message})
                    flash(message, 'error')
                    return redirect(url_for('dashboard'))
                db.session.delete(item) # type: ignore
                db.session.commit() # type: ignore
                success = True
                message = 'Book deleted successfully'
            else:
                message = 'Book not found'
        elif type == 'customer':
            item = db.session.query(User).filter_by(id=id, role='customer').first() # type: ignore
            if item:
                if item.borrow_records or item.book_sales:
                    message = 'Cannot delete customer with borrow records or purchases'
                    if request.headers.get('Content-Type') == 'application/json':
                        return jsonify({'success': False, 'error': message})
                    flash(message, 'error')
                    return redirect(url_for('dashboard'))
                db.session.delete(item) # type: ignore
                db.session.commit() # type: ignore
                success = True
                message = 'Customer deleted successfully'
            else:
                message = 'Customer not found'
        else:
            message = 'Invalid item type'
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error deleting {type}: {str(e)}")
        message = f'Error deleting {type}'
    
    # If the request is AJAX (fetch), return JSON
    if request.headers.get('Content-Type') == 'application/json':
        return jsonify({'success': success, 'error': None if success else message})
    # Otherwise, redirect (for normal form POSTs)
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    return redirect(url_for('dashboard'))

@app.route('/admin/<string:type>/toggle-status/<int:id>', methods=['POST'])
@login_required
def admin_toggle_status(type, id):
    """Toggle active status of librarian, book, or customer"""
    try:
        if type == 'librarian':
            item = db.session.query(User).filter_by(id=id, role='librarian').first() # type: ignore
            if item:
                item.is_active = not item.is_active
                db.session.commit() # type: ignore
                return jsonify({'success': True, 'is_active': item.is_active})
                
        elif type == 'book':
            item = db.session.query(Book).get(id) # type: ignore
            if item:
                item.is_available = not item.is_available
                db.session.commit() # type: ignore
                return jsonify({'success': True, 'is_available': item.is_available})
                
        elif type == 'customer':
            item = db.session.query(User).filter_by(id=id, role='customer').first() # type: ignore
            if item:
                item.is_active = not item.is_active
                db.session.commit() # type: ignore
                return jsonify({'success': True, 'is_active': item.is_active})
                
        return jsonify({'error': 'Item not found'}), 404
        
    except Exception as e:
        db.session.rollback() # type: ignore
        current_app.logger.error(f"Error toggling {type} status: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/admin/branch/add', methods=['POST'])
@login_required
@admin_required
def admin_add_branch():
    """Add a new library branch"""
    try:
        name = request.form.get('name')
        location = request.form.get('location')
        phone = request.form.get('phone')
        
        if not all([name, location, phone]):
            flash('All fields are required', 'error')
            return redirect(url_for('admin_dashboard'))
        
        branch = LibraryBranch(
            name=name,
            location=location,
            phone=phone
        )
        
        db.session.add(branch) # type: ignore
        db.session.commit() # type: ignore
        flash('Branch added successfully', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error adding branch: {str(e)}")
        flash('Error adding branch', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/librarian/add', methods=['POST'])
@login_required
@admin_required
def admin_add_librarian():
    """Add a new librarian"""
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        branch_id = request.form.get('branch_id')
        security_question = request.form.get('security_question')
        security_answer = request.form.get('security_answer')
        
        if not all([username, email, password, branch_id, security_question, security_answer]):
            flash('All fields are required', 'error')
            return redirect(url_for('admin_dashboard'))

        try:
            branch_id_int = int(branch_id) # type: ignore
        except (TypeError, ValueError):
            flash('Invalid branch selected', 'error')
            return redirect(url_for('admin_dashboard'))

        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return redirect(url_for('admin_dashboard'))

        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return redirect(url_for('admin_dashboard'))

        # Generate verification token
        verification_token = secrets.token_urlsafe(32)
        verification_token_expires = datetime.utcnow() + timedelta(hours=24)

        librarian = User(
            username=username,
            email=email,
            role='librarian',
            branch_id=branch_id_int,
            security_question=security_question,
            security_answer=security_answer.lower(),  # Store answer in lowercase # type: ignore
            verification_token=verification_token,
            verification_token_expires=verification_token_expires,
            is_verified=False  # Set to false until email is verified
        )
        librarian.set_password(password) # type: ignore
        
        try:
            db.session.add(librarian) # type: ignore
            db.session.commit() # type: ignore
            
            # Send verification email
            verification_url = url_for('verify_email', token=verification_token, _external=True)
            msg = Message('Verify Your Email - Library Management System',
                        recipients=[email]) # type: ignore
            msg.html = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Welcome to the Library Management System!</h2>
                <p>You have been added as a librarian by the system administrator.</p>
                <p>Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background-color: #4CAF50; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-size: 16px;
                              margin: 10px 0;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{verification_url}</p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you did not expect this email, please contact the system administrator.</p>
            </div>
            '''
            mail.send(msg)
            
            flash('Librarian added successfully. A verification email has been sent.', 'success')
            
        except Exception as e:
            db.session.rollback() # type: ignore
            app.logger.error(f"Error adding librarian: {str(e)}")
            flash(f'Error adding librarian: {str(e)}', 'error')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error adding librarian: {str(e)}")
        flash(f'Error adding librarian: {str(e)}', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/book/add', methods=['POST'])
@login_required
@admin_required
def admin_add_book():
    """Add a new book"""
    try:
        title = request.form.get('title')
        author = request.form.get('author')
        isbn = request.form.get('isbn')
        branch_id = request.form.get('branch_id')
        quantity = int(request.form.get('quantity', 1))
        price = float(request.form.get('price', 0.0))
        description = request.form.get('description')
        category = request.form.get('category')
        
        if not all([title, author, isbn, branch_id]):
            flash('All fields are required', 'error')
            return redirect(url_for('admin_dashboard'))
        
        book = Book(
            title=title,
            author=author,
            isbn=isbn,
            branch_id=int(branch_id), # type: ignore
            quantity=quantity,
            available_quantity=quantity,
            price=price,
            description=description,
            category=category
        )
        
        # Handle cover image upload
        if 'cover_image' in request.files:
            file = request.files['cover_image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename) # type: ignore
                unique_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                book.cover_image = 'uploads/' + unique_filename
        
        db.session.add(book) # type: ignore
        db.session.commit() # type: ignore
        flash('Book added successfully', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error adding book: {str(e)}")
        flash('Error adding book', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/customer/add', methods=['POST'])
@login_required
@admin_required
def admin_add_customer():
    """Add a new customer"""
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        security_question = request.form.get('security_question')
        security_answer = request.form.get('security_answer')
        
        if not all([username, email, password, security_question, security_answer]):
            flash('All fields are required', 'error')
            return redirect(url_for('admin_dashboard'))
        
        customer = User(
            username=username,
            email=email,
            role='customer',
            is_active=True,
            security_question=security_question,
            security_answer=security_answer.lower()  # Store answer in lowercase # type: ignore
        )
        customer.set_password(password) # type: ignore
        
        db.session.add(customer) # type: ignore
        db.session.commit() # type: ignore
        flash('Customer added successfully', 'success')
        
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f"Error adding customer: {str(e)}")
        flash('Error adding customer', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/dashboard')
@login_required
@admin_required
def admin_dashboard():
    """Admin dashboard view"""
    try:
        app.logger.info("Loading admin dashboard...")
        # Get search parameters
        search_query = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Initialize default values
        total_books = total_users = total_borrows = total_sales = 0
        recent_activities = []
        branches = None
        librarians = customers = []

        # Get statistics
        try:
            total_books = db.session.query(func.sum(Book.quantity)).scalar() or 0 # type: ignore
            total_users = db.session.query(User).count() # type: ignore
            total_borrows = db.session.query(BorrowRecord).count() # type: ignore
            total_sales = db.session.query(BookSale).count() # type: ignore
            app.logger.info(f"Stats: books={total_books}, users={total_users}, borrows={total_borrows}, sales={total_sales}")
        except Exception as stats_error:
            import traceback
            tb = traceback.format_exc()
            app.logger.error(f"Error getting statistics: {str(stats_error)}\n{tb}")
            db.session.rollback() # type: ignore

        # Get recent activities
        try:
            recent_activities = db.session.query(Activity).order_by(Activity.timestamp.desc()).limit(10).all() # type: ignore
            app.logger.info(f"Loaded {len(recent_activities)} recent activities.")
        except Exception as activities_error:
            import traceback
            tb = traceback.format_exc()
            app.logger.error(f"Error getting recent activities: {str(activities_error)}\n{tb}")
            db.session.rollback() # type: ignore

        # Get branches with pagination
        try:
            branches_query = db.session.query(LibraryBranch) # type: ignore
            if search_query:
                branches_query = branches_query.filter(LibraryBranch.name.ilike(f'%{search_query}%'))
            branches = branches_query.paginate(page=page, per_page=per_page, error_out=False)
            app.logger.info(f"Loaded branches page {page} with {branches.total} total branches.")
        except Exception as branches_error:
            import traceback
            tb = traceback.format_exc()
            app.logger.error(f"Error getting branches: {str(branches_error)}\n{tb}")
            db.session.rollback() # type: ignore

        # Get all librarians and customers
        try:
            librarians = db.session.query(User).filter_by(role='librarian').all() # type: ignore
            customers = db.session.query(User).filter_by(role='customer').all() # type: ignore
            books = db.session.query(Book).all() # type: ignore
            borrows = db.session.query(BorrowRecord).all() # type: ignore
            sales = db.session.query(BookSale).all() # type: ignore
            app.logger.info(f"Loaded {len(librarians)} librarians, {len(customers)} customers, {len(books)} books, {len(borrows)} borrows, {len(sales)} sales.")
        except Exception as users_error:
            import traceback
            tb = traceback.format_exc()
            app.logger.error(f"Error getting users: {str(users_error)}\n{tb}")
            db.session.rollback() # type: ignore

        app.logger.info("Admin dashboard loaded successfully")
        return render_template('admin_dashboard.html',
                            total_books=total_books,
                            total_users=total_users,
                            total_borrows=total_borrows,
                            total_sales=total_sales,
                            recent_activities=recent_activities,
                            branches=branches,
                            librarians=librarians,
                            customers=customers,
                            books=books,
                            borrows=borrows,
                            sales=sales,
                            search=search_query,
                            per_page=per_page)

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Error loading admin dashboard: {str(e)}\n{tb}")
        db.session.rollback() # type: ignore
        flash('Error loading admin dashboard. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/librarian/sell_book/<int:book_id>', methods=['POST'])
@login_required
def librarian_sell_book(book_id):
    if current_user.role != 'librarian':
        flash('Unauthorized access')
        return redirect(url_for('dashboard'))
    try:
        customer_id = request.form.get('customer_id')
        quantity_str = request.form.get('quantity', '1')
        try:
            quantity = int(quantity_str)
            if quantity <= 0:
                quantity = 1
        except (ValueError, TypeError):
            quantity = 1
        if not customer_id:
            flash('Customer selection is required')
            return redirect(url_for('dashboard'))
        book = db.session.query(Book).filter_by(id=book_id).first() # type: ignore
        if not book:
            flash('Book not found', 'error')
            return redirect(url_for('dashboard'))
        if quantity > book.available_quantity:
            flash('Not enough books in stock', 'error')
            return redirect(url_for('dashboard'))
        sale = BookSale(
            book_id=book.id,
            user_id=int(customer_id),
            quantity=quantity,
            price=book.price * quantity,
            sale_date=datetime.utcnow()
        )
        book.available_quantity -= quantity
        try:
            db.session.add(sale) # type: ignore
            db.session.commit() # type: ignore
            flash(f'Successfully sold {quantity} book(s) to customer', 'success')
            # Optionally, send notification to customer
            send_notification(
                int(customer_id),
                f'You have purchased {quantity} copy/copies of {book.title}',
                'purchase'
            )
            return redirect(url_for('dashboard'))
        except Exception as e:
            db.session.rollback() # type: ignore
            app.logger.error(f"Error during book sale: {str(e)}")
            flash('Error processing sale', 'error')
            return redirect(url_for('dashboard'))
    except Exception as e:
        app.logger.error(f"Error in librarian_sell_book: {str(e)}")
        flash('Error processing request', 'error')
        return redirect(url_for('dashboard'))

@app.route('/cancel_purchase/<int:sale_id>', methods=['POST'])
@login_required
def cancel_purchase(sale_id):
    # Always use db.session for all ORM operations in this route
    sale = db.session.query(BookSale).get(sale_id) # type: ignore
    if not sale or sale.user_id != current_user.id:
        flash('Invalid purchase record.', 'error')
        return redirect(url_for('dashboard'))
    # Only allow cancellation within 24 hours
    if (datetime.utcnow() - sale.sale_date).total_seconds() > 86400:
        flash('Cannot cancel purchase after 24 hours.', 'error')
        return redirect(url_for('dashboard'))
    try:
        # Refund the quantity to the book
        book = db.session.query(Book).get(sale.book_id) # type: ignore
        if book:
            book.quantity += sale.quantity
        # Optionally, delete the sale record
        db.session.delete(sale) # type: ignore
        db.session.commit() # type: ignore
        flash('Purchase canceled and refunded successfully.', 'success')
        # Optionally, send notification
        send_notification(
            current_user.id,
            f'Your purchase of {sale.quantity} copy/copies of {book.title if book else "the book"} has been canceled and refunded.',
            'purchase_cancel'
        )
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        app.logger.error(f"Error canceling purchase for sale_id {sale_id}: {str(e)}\n{tb}")
        db.session.rollback() # type: ignore
        flash('Error canceling purchase.', 'error')
    return redirect(url_for('dashboard'))

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')
    
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10, encoding='utf-8')
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Library Management System startup')

# After db = SQLAlchemy(app)
migrate = Migrate(app, db)

@app.route('/librarian/return_book/<int:borrow_id>', methods=['POST'])
@login_required
def librarian_return_book(borrow_id):
    if current_user.role != 'librarian':
        flash('Unauthorized access', 'error')
        return redirect(url_for('dashboard'))
    try:
        borrow_record = db.session.query(BorrowRecord).filter_by(id=borrow_id, is_returned=False).first() # type: ignore
        if not borrow_record:
            flash('Invalid borrow record or already returned', 'error')
            return redirect(url_for('dashboard'))
        book = db.session.query(Book).get(borrow_record.book_id) # type: ignore
        if book:
            book.quantity += 1
        borrow_record.is_returned = True
        borrow_record.return_date = datetime.utcnow()
        db.session.commit() # type: ignore
        flash('Book returned successfully.', 'success')
        app.logger.info(f'Librarian {current_user.username} returned book id {borrow_record.book_id} for user {borrow_record.user_id}')
    except Exception as e:
        db.session.rollback() # type: ignore
        app.logger.error(f'Error in librarian_return_book: {str(e)}')
        flash('Error processing return.', 'error')
    return redirect(url_for('dashboard'))

@app.route('/test-email')
def test_email():
    """Test route to verify email configuration"""
    try:
        # Get the test email address from the query parameter or use a default
        test_email = request.args.get('email', 'your-email@gmail.com')
        
        # Create a test message
        msg = Message('Test Email - Library Management System',
                    recipients=[test_email]) # type: ignore
        msg.html = '''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Test Email</h2>
            <p>This is a test email from the Library Management System.</p>
            <p>If you received this email, your email configuration is working correctly!</p>
        </div>
        '''
        
        # Send the email
        mail.send(msg)
        flash('Test email sent successfully! Please check your inbox.', 'success')
        app.logger.info(f"Test email sent successfully to {test_email}")
        
    except Exception as e:
        flash(f'Error sending test email: {str(e)}', 'error')
        app.logger.error(f"Error sending test email: {str(e)}")
    
    return redirect(url_for('admin_dashboard'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 