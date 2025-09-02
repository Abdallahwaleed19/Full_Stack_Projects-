from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from models import Base # type: ignore

db = SQLAlchemy()

def init_db(app):
    """Initialize the database and create all tables."""
    db.init_app(app)
    
    # Create engine and session
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    db.session = scoped_session(sessionmaker(bind=engine))
    
    # Import all models and create tables
    Base.metadata.create_all(bind=engine)
    
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove() 