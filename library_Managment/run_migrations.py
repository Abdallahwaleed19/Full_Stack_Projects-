from alembic.config import Config
from alembic import command
from pathlib import Path
from models import db
from migrations import create_app

def run_migrations():
    # Create the Flask app and initialize the database
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Create all tables with the new schema
        db.create_all()
        print("Database tables recreated successfully")

if __name__ == '__main__':
    run_migrations() 