from django.shortcuts import render, redirect
books_data = [
    {'id': 1, 'title': 'Book1', 'author': {'id': 1, 'name': 'Abdallah'}, 'price': 100},
    {'id': 2, 'title': 'Book2', 'author': {'id': 2, 'name': 'Saif'}, 'price': 120},
    {'id': 3, 'title': 'Book3', 'author': {'id': 1, 'name': 'Sara'}, 'price': 90},
]

def home(request):
    return render(request, 'Books/home.html')

def books(request):
    if request.method == 'POST':
        book_id = int(request.POST.get('book_id'))
        book = next((b for b in books_data if b['id'] == book_id), None)
        if book:
            book['title'] = request.POST.get('title', book['title'])
            book['price'] = request.POST.get('price', book['price'])
    return render(request, 'Books/books.html', {'books': books_data})

def author(request):
    return render(request, 'Books/author.html')

def book_detail(request, book_id):
    book = next((b for b in books_data if b['id'] == book_id), None)
    return render(request, 'Books/book_detail.html', {'book': book})

def book_edit(request, book_id):
    book = next((b for b in books_data if b['id'] == book_id), None)
    if not book:
        return render(request, 'Books/book_edit.html', {'book': None, 'error': 'Book not found'})
    if request.method == 'POST':
        book['title'] = request.POST.get('title', book['title'])
        book['price'] = request.POST.get('price', book['price'])
        return redirect('books')
    return render(request, 'Books/book_edit.html', {'book': book})

def book_delete(request, book_id):
    book = next((b for b in books_data if b['id'] == book_id), None)
    if not book:
        return render(request, 'Books/book_delete.html', {'book': None, 'error': 'Book not found'})
    if request.method == 'POST':
        books_data.remove(book)
        return redirect('books')
    return render(request, 'Books/book_delete.html', {'book': book})

