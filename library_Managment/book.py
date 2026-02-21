class Book:
    def __init__(self, id_book: int, title: str, author_id: int):
        self.id_book = id_book
        self.title = title
        self.availability = True
        self.author_id = author_id
    
    def is_available(self) -> bool:
        return self.availability 