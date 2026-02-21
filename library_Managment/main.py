from author import Author
from book import Book
from customer import Customer
from employees import Assistant, Librarian
from library_branch import LibraryBranch

def main():
    # Create a library branch
    branch = LibraryBranch(1, "123 Main St", "555-0123", "Central Library")
    
    # Create authors
    author1 = Author(1, "John Smith", "Famous mystery writer")
    author2 = Author(2, "Jane Doe", "Renowned sci-fi author")
    
    # Create books
    book1 = Book(1, "The Mystery House", author1.id)
    book2 = Book(2, "Space Adventures", author2.id)
    
    # Add books to library
    branch.add_book(book1)
    branch.add_book(book2)
    
    # Create employees
    assistant = Assistant(1, "Mike Johnson", "Shelving books")
    librarian = Librarian(2, "Sarah Wilson", "Cataloging expert")
    
    # Create a customer
    customer = Customer(1, "Bob Brown", "456 Oak St")
    
    # Customer gets a library card
    customer.buy_library_card(branch)
    
    # Customer checks out a book
    customer.checkout_book(book1)
    
    # Try to check out the same book again
    customer.checkout_book(book1)
    
    # Employees helping
    assistant.help_librarian()
    librarian.manage_books()
    
    # Author writes a new book
    author1.write_book()

if __name__ == "__main__":
    main() 