class Employee:
    def __init__(self, id: int, name: str, role: str):
        self.id = id
        self.name = name
        self.role = role
    
    def assist_for_customer(self) -> None:
        print(f"{self.role} {self.name} is assisting a customer")


class Assistant(Employee):
    def __init__(self, id: int, name: str, tasks: str):
        super().__init__(id, name, "Assistant")
        self.tasks = tasks
    
    def help_librarian(self) -> None:
        print(f"Assistant {self.name} is helping the librarian with {self.tasks}")


class Librarian(Employee):
    def __init__(self, id: int, name: str, skills: str):
        super().__init__(id, name, "Librarian")
        self.skills = skills
    
    def manage_books(self) -> None:
        print(f"Librarian {self.name} is managing books using {self.skills}") 