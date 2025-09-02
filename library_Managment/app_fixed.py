@app.route('/dashboard')
@login_required
def dashboard():
    """Handle dashboard access for different user roles"""
    try:
        app.logger.info(f"User {current_user.username} (role: {current_user.role}) accessing dashboard")
        
        if not current_user.role:
            app.logger.error(f"User {current_user.username} has no role assigned")
            flash('User role not assigned. Please contact an administrator.', 'error')
            return redirect(url_for('index'))

        session = g.db_session

        if current_user.role == 'admin':
            try:
                # Use joinedload for eager loading of relationships
                branches = session.query(LibraryBranch).options(
                    joinedload(LibraryBranch.books),
                    joinedload(LibraryBranch.librarians)
                ).all()
                
                librarians = session.query(User).filter(User.role == 'librarian').all()
                books = session.query(Book).options(
                    joinedload(Book.branch)
                ).all()
                customers = session.query(User).filter(User.role == 'customer').all()

                # Calculate statistics
                stats = {
                    'total_books': session.query(func.sum(Book.quantity)).scalar() or 0,
                    'total_customers': session.query(User).filter(User.role == 'customer').count(),
                    'total_librarians': len(librarians),
                    'total_branches': len(branches),
                    'active_borrows': session.query(BorrowRecord).filter(
                        BorrowRecord.return_date == None
                    ).count()
                }

                app.logger.info("Admin dashboard data loaded successfully")
                return render_template('admin_dashboard.html', 
                                    branches=branches,
                                    librarians=librarians,
                                    books=books,
                                    customers=customers,
                                    stats=stats,
                                    current_time=datetime.utcnow())

            except Exception as db_error:
                app.logger.error(f"Admin dashboard database error: {str(db_error)}")
                session.rollback()
                flash('Error loading admin dashboard data. Please try again.', 'error')
                return redirect(url_for('index'))

        elif current_user.role == 'librarian':
            try:
                # Get librarian's branch with eager loading
                branch = session.query(LibraryBranch).options(
                    joinedload(LibraryBranch.books)
                ).get(current_user.branch_id)
                
                if not branch:
                    flash('You are not assigned to any branch. Please contact an administrator.', 'error')
                    return redirect(url_for('index'))
                
                # Get branch data with efficient queries
                branch_books = session.query(Book).filter(
                    Book.branch_id == branch.id
                ).options(
                    joinedload(Book.borrow_records)
                ).all()

                active_borrows = session.query(BorrowRecord).join(
                    Book
                ).filter(
                    Book.branch_id == branch.id,
                    BorrowRecord.return_date == None
                ).options(
                    joinedload(BorrowRecord.user),
                    joinedload(BorrowRecord.book)
                ).all()

                customers = session.query(User).filter(
                    User.role == 'customer'
                ).options(
                    joinedload(User.library_cards)
                ).all()

                app.logger.info("Librarian dashboard data loaded successfully")
                return render_template('librarian_dashboard.html', 
                                    books=branch_books,
                                    borrow_records=active_borrows,
                                    branch=branch,
                                    customers=customers,
                                    current_time=datetime.utcnow())

            except Exception as db_error:
                app.logger.error(f"Librarian dashboard database error: {str(db_error)}")
                session.rollback()
                flash('Error loading librarian dashboard data. Please try again.', 'error')
                return redirect(url_for('index'))

        elif current_user.role == 'customer':
            try:
                # Get customer data with efficient eager loading
                borrowed_books = session.query(BorrowRecord).filter(
                    BorrowRecord.user_id == current_user.id,
                    BorrowRecord.return_date == None
                ).options(
                    joinedload(BorrowRecord.book).joinedload(Book.branch)
                ).all()

                library_cards = session.query(LibraryCard).filter(
                    LibraryCard.user_id == current_user.id
                ).options(
                    joinedload(LibraryCard.branch)
                ).all()

                purchased_books = session.query(BookSale).filter(
                    BookSale.user_id == current_user.id
                ).options(
                    joinedload(BookSale.book)
                ).order_by(
                    BookSale.sale_date.desc()
                ).all()

                notifications = session.query(Notification).filter(
                    Notification.user_id == current_user.id,
                    Notification.is_read == False
                ).order_by(
                    Notification.created_at.desc()
                ).all()

                app.logger.info("Customer dashboard data loaded successfully")
                return render_template('customer_dashboard.html',
                                    borrowed_books=borrowed_books,
                                    library_cards=library_cards,
                                    purchased_books=purchased_books,
                                    notifications=notifications,
                                    current_time=datetime.utcnow())

            except Exception as db_error:
                app.logger.error(f"Customer dashboard database error: {str(db_error)}")
                session.rollback()
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