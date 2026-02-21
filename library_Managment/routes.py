from flask import request, redirect, url_for, flash, render_template, g
from app import app, db
from models import User
from app import RegistrationForm

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        # Check if username or email already exists
        if g.db_session.query(User).filter_by(username=form.username.data).first():
            flash('Username already exists. Please choose a different one.', 'error')
            return redirect(url_for('register'))
        
        if g.db_session.query(User).filter_by(email=form.email.data).first():
            flash('Email already registered. Please use a different email.', 'error')
            return redirect(url_for('register'))
        
        # Create new user
        user = User(
            username=form.username.data,
            email=form.email.data,
            role='user',
            security_question=form.security_question.data,
            security_answer=form.security_answer.data.lower()  # Store answer in lowercase # type: ignore
        )
        user.set_password(form.password.data) # type: ignore
        
        try:
            g.db_session.add(user)
            g.db_session.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            g.db_session.rollback()
            flash('An error occurred during registration. Please try again.', 'error')
            app.logger.error(f"Registration error: {str(e)}")
            return redirect(url_for('register'))
    
    return render_template('register.html', form=form) 