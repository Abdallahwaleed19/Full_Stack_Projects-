class Author:
    def __init__(self, id: int, name: str, biography: str):
        self.id = id
        self.name = name
        self.biography = biography
 
    def write_book(self) -> None:
        print(f"Author {self.name} is writing a new book") 