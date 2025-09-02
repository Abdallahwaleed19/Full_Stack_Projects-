class Customer:
    def __init__(self, id: int, name: str, address: str):
        self.id = id
        self.name = name
        self.address = address
        self.checked_out_books = []
        self.library_card = None
    
    def checkout_book(self, book) -> None:
        if book.is_available():
            self.checked_out_books.append(book)
            book.availability = False
            print(f"Book '{book.title}' checked out successfully")
        else:
            print(f"Book '{book.title}' is not available")
    
    def buy_library_card(self, library_branch) -> None:
        self.library_card = library_branch.create_library_card()
        print(f"Library card created for {self.name}") 