from library_card import LibraryCard

class LibraryBranch:
    def __init__(self, id: int, location: str, phone_number: str, branch_name: str):
        self.id = id
        self.location = location
        self.phone_number = phone_number
        self.branch_name = branch_name
        self.books = []
        self.library_cards = []
        self.card_counter = 1000  # Starting ID for library cards
    
    def add_book(self, book) -> None:
        self.books.append(book)
        print(f"Book '{book.title}' added to {self.branch_name}")
    
    def sell_book(self, book) -> None:
        if book in self.books:
            self.books.remove(book)
            print(f"Book '{book.title}' sold from {self.branch_name}")
        else:
            print(f"Book '{book.title}' not available in {self.branch_name}")
    
    def create_library_card(self) -> LibraryCard:
        self.card_counter += 1
        new_card = LibraryCard(self.card_counter)
        self.library_cards.append(new_card)
        return new_card 