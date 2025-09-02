from flask import Flask
from models import db, User, LibraryBranch, Book
from datetime import datetime, timedelta
from config import Config
from werkzeug.security import generate_password_hash

def init_db():
    # Create Flask app
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize database
    db.init_app(app)
    
    with app.app_context():
        # Drop all existing tables
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Create a main branch if none exists
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
            branch_id=main_branch.id
        )
        admin.set_password('admin123')
        db.session.add(admin) # type: ignore
        db.session.commit() # type: ignore
        
        # Add sample books
        sample_books = [
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'isbn': '978-0743273565',
                'quantity': 5,
                'available_quantity': 5,
                'price': 9.99,
                'branch_id': main_branch.id,
                'description': 'A story of decadence and excess.',
                'publication_year': 1925,
                'publisher': 'Scribner',
                'category': 'Fiction'
            },
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'isbn': '978-0446310789',
                'quantity': 5,
                'available_quantity': 5,
                'price': 12.99,
                'branch_id': main_branch.id,
                'description': 'A classic of modern American literature.',
                'publication_year': 1960,
                'publisher': 'Grand Central Publishing',
                'category': 'Fiction'
            },
            {
                'title': '1984',
                'author': 'George Orwell',
                'isbn': '978-0451524935',
                'quantity': 5,
                'available_quantity': 5,
                'price': 10.99,
                'branch_id': main_branch.id,
                'description': 'A dystopian social science fiction novel.',
                'publication_year': 1949,
                'publisher': 'Signet Classic',
                'category': 'Science Fiction'
            }
        ]
        
        for book_data in sample_books:
            book = Book(**book_data)
            db.session.add(book) # type: ignore
        
        db.session.commit() # type: ignore
        print("Database initialized successfully!")
        print("Admin user created with:")
        print("Email: admin@library.com")
        print("Password: admin123")

if __name__ == '__main__':
    init_db() 