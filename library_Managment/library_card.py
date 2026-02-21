from datetime import datetime, timedelta

class LibraryCard:
    def __init__(self, id: int):
        self.id = id
        self.active_date = datetime.now()
        self.expired_date = self.active_date + timedelta(days=365)  # Valid for 1 year
    
    def is_active(self) -> bool:
        return datetime.now() <= self.expired_date
    
    def is_expired(self) -> bool:
        return not self.is_active() 