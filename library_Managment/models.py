from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask import url_for
import os
from typing import Optional, List, Any
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text, desc, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker

# Initialize SQLAlchemy
db = SQLAlchemy()

# Base class for all models
Base = declarative_base()

class User(db.Model, UserMixin):
    """User model representing customers, librarians and admins"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128))
    role = Column(String(20), nullable=False, default='customer')
    branch_id = Column(Integer, ForeignKey('library_branches.id'))
    reset_token = Column(String(100), unique=True)
    reset_token_expiry = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), unique=True)
    verification_token_expires = Column(DateTime)
    
    # Security fields
    security_question = Column(String(200))
    security_answer = Column(String(200))
    
    # Profile fields
    profile_photo = Column(String(255))
    full_name = Column(String(100))
    phone = Column(String(20))
    address = Column(String(200))
    bio = Column(Text)
    date_joined = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    branch = relationship('LibraryBranch', back_populates='librarians')
    library_cards = relationship('LibraryCard', back_populates='user')
    borrow_records = relationship('BorrowRecord', back_populates='user')
    book_sales = relationship('BookSale', back_populates='user')
    notifications = relationship('Notification', back_populates='user')
    activities = relationship('Activity', back_populates='user')
    
    @property
    def is_admin(self) -> bool:
        """Check if the user has admin role"""
        return self.role == 'admin'
    
    def set_password(self, password: str) -> None:
        """Set the password hash for the user"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """Check if the provided password matches the hash"""
        return check_password_hash(self.password_hash, password)
    
    def get_profile_photo_url(self) -> str:
        """Get the URL for the user's profile photo"""
        if self.profile_photo:
            return f"/static/{self.profile_photo}"
        return "/static/images/default-profile.png"
    
    def __repr__(self) -> str:
        return f'<User {self.username}>'

class LibraryBranch(db.Model):
    """Library branch model"""
    __tablename__ = 'library_branches'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    phone = Column(String(20))
    email = Column(String(120))
    opening_hours = Column(String(200))
    
    # Relationships
    librarians = relationship('User', back_populates='branch')
    books = relationship('Book', back_populates='branch')
    library_cards = relationship('LibraryCard', back_populates='branch')
    
    def __repr__(self) -> str:
        return f'<LibraryBranch {self.name}>'

class Book(db.Model):
    """Book model"""
    __tablename__ = 'books'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    isbn = Column(String(13), unique=True, nullable=False)
    publication_year = Column(Integer)
    publisher = Column(String(100))
    category = Column(String(50))
    description = Column(Text)
    quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, default=1)
    location = Column(String(50))
    branch_id = Column(Integer, ForeignKey('library_branches.id'))
    cover_image = Column(String(255))
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    
    # Relationships
    branch = relationship('LibraryBranch', back_populates='books')
    borrow_records = relationship('BorrowRecord', back_populates='book')
    sales = relationship('BookSale', back_populates='book')
    
    def __repr__(self) -> str:
        return f'<Book {self.title}>'

class LibraryCard(db.Model):
    """Library card model"""
    __tablename__ = 'library_cards'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    branch_id = Column(Integer, ForeignKey('library_branches.id'))
    issue_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    card_number = Column(String(50), unique=True, nullable=False)
    price = Column(Float, default=10.0)
    
    # Relationships
    user = relationship('User', back_populates='library_cards')
    branch = relationship('LibraryBranch', back_populates='library_cards')
    
    def __repr__(self) -> str:
        return f'<LibraryCard {self.card_number}>'

class BorrowRecord(db.Model):
    """Borrow record model"""
    __tablename__ = 'borrow_records'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    book_id = Column(Integer, ForeignKey('books.id'))
    borrow_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime)
    is_returned = Column(Boolean, nullable=False, default=False)
    fine_amount = Column(Float, default=0.0)
    
    # Relationships
    user = relationship('User', back_populates='borrow_records')
    book = relationship('Book', back_populates='borrow_records')
    
    def __repr__(self) -> str:
        return f'<BorrowRecord {self.id}>'

class BookSale(db.Model):
    """Book sale model"""
    __tablename__ = 'book_sales'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    book_id = Column(Integer, ForeignKey('books.id'))
    sale_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='book_sales')
    book = relationship('Book', back_populates='sales')
    
    def __repr__(self) -> str:
        return f'<BookSale {self.id}>'

class Notification(db.Model):
    """Notification model"""
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message = Column(String(500), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_read = Column(Boolean, nullable=False, default=False)
    notification_type = Column(String(50))
    
    # Relationships
    user = relationship('User', back_populates='notifications')
    
    def __repr__(self) -> str:
        return f'<Notification {self.id}>'

class Activity(db.Model):
    """Activity model for tracking user actions in the system"""
    __tablename__ = 'activities'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    action = Column(String(100), nullable=False)
    details = Column(String(500))
    
    # Relationships
    user = relationship('User', back_populates='activities')
    
    def __repr__(self) -> str:
        return f'<Activity {self.id}: {self.action}>'