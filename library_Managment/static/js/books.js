document.addEventListener('DOMContentLoaded', function () {
    const bookModal = document.getElementById('addBookModal');
    const bookForm = document.getElementById('bookForm');
    const modalTitle = document.getElementById('bookModalLabel');

    // Function to reset form
    function resetBookForm() {
        bookForm.reset();
        document.getElementById('bookId').value = '';
        modalTitle.textContent = 'Add Book';
        bookForm.action = '/admin/add_book';
    }

    // Handle modal close
    bookModal.addEventListener('hidden.bs.modal', function () {
        resetBookForm();
    });

    // Open modal for adding new book
    document.querySelectorAll('.add-book-btn').forEach(button => {
        button.addEventListener('click', function () {
            resetBookForm();
            new bootstrap.Modal(bookModal).show();
        });
    });

    // Open modal for editing book
    document.querySelectorAll('.edit-book-btn').forEach(button => {
        button.addEventListener('click', function () {
            const bookId = this.dataset.bookId;
            modalTitle.textContent = 'Edit Book';
            bookForm.action = `/admin/edit_book/${bookId}`;

            // Fetch book details
            fetch(`/admin/get_book/${bookId}`)
                .then(response => response.json())
                .then(book => {
                    document.getElementById('bookId').value = book.id;
                    document.getElementById('bookTitle').value = book.title;
                    document.getElementById('bookAuthor').value = book.author;
                    document.getElementById('bookISBN').value = book.isbn;
                    document.getElementById('bookQuantity').value = book.quantity;
                    document.getElementById('bookCategory').value = book.category_id;
                    document.getElementById('bookBranch').value = book.branch_id;
                    document.getElementById('bookDescription').value = book.description || '';
                })
                .catch(error => {
                    console.error('Error fetching book details:', error);
                    alert('Error loading book details. Please try again.');
                });

            new bootstrap.Modal(bookModal).show();
        });
    });

    // Handle form submission
    bookForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);

        fetch(this.action, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bootstrap.Modal.getInstance(bookModal).hide();
                    // Reload the page to show updated book list
                    window.location.reload();
                } else {
                    alert(data.message || 'Error saving book. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error saving book:', error);
                alert('Error saving book. Please try again.');
            });
    });

    // Handle book deletion
    document.querySelectorAll('.delete-book-btn').forEach(button => {
        button.addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this book?')) {
                const bookId = this.dataset.bookId;

                fetch(`/admin/delete_book/${bookId}`, {
                    method: 'POST'
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.reload();
                        } else {
                            alert(data.message || 'Error deleting book. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting book:', error);
                        alert('Error deleting book. Please try again.');
                    });
            }
        });
    });
}); 