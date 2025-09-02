from django.shortcuts import render, redirect
from .models import Book, Author
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
import json

books_data = [
    {'id': 1, 'title': 'Book1', 'author': {'id': 1, 'name': 'Abdallah'}, 'price': 100},
    {'id': 2, 'title': 'Book2', 'author': {'id': 2, 'name': 'Saif'}, 'price': 120},
    {'id': 3, 'title': 'Book3', 'author': {'id': 1, 'name': 'Sara'}, 'price': 90},
]

def home(request):
    return render(request, 'Books/home.html')

def books(request):
    books_qs = Book.objects.select_related('author').all()
    return render(request, 'Books/books.html', {'books': books_qs})

def author(request):
    return render(request, 'Books/author.html')

def author_add(request):
    if request.method == "POST":
        name = request.POST.get('name')
        if name:
            Author.objects.get_or_create(name=name)
            return redirect('authors')
    return render(request, 'Books/author_add.html')

def book_detail(request, book_id):
    book = next((b for b in books_data if b['id'] == book_id), None)
    return render(request, 'Books/book_detail.html', {'book': book})

def book_edit(request, book_id):
    try:
        book = Book.objects.select_related('author').get(pk=book_id)
    except Book.DoesNotExist:
        return render(request, 'Books/book_edit.html', {'book': None, 'error': 'Book not found'})
    if request.method == 'POST':
        title = request.POST.get('title')
        author_name = request.POST.get('author')
        price = request.POST.get('price')
        image = request.FILES.get('image')
        if title and author_name and price:
            author, _ = Author.objects.get_or_create(name=author_name)
            book.title = title
            book.author = author
            book.price = price
            if image:
                book.image = image
            book.save()
            return redirect('books')
    return render(request, 'Books/book_edit.html', {'book': book})

def book_delete(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return render(request, 'Books/book_delete.html', {'book': None, 'error': 'Book not found'})
    if request.method == 'POST':
        book.delete()
        return redirect('books')
    return render(request, 'Books/book_delete.html', {'book': book})

def book_add(request):
    if request.method == "POST":
        title = request.POST.get('title')
        author_name = request.POST.get('author')
        price = request.POST.get('price')
        image = request.FILES.get('image')
        if title and author_name and price:
            author, created = Author.objects.get_or_create(name=author_name)
            Book.objects.create(title=title, author=author, price=price, image=image)
            return redirect('books')
    return render(request, 'Books/book_add.html')

def add_author(request):
    if request.method == 'POST':
        name = request.POST['name']
        Author.objects.create(name=name)
        return redirect('books')
    return render(request, 'Books/author_add.html')

@csrf_exempt
def api_show_books(request):
    if request.method == 'GET':
        books = Book.objects.select_related('author').all()
        data = [
            {
                'id': book.id, 
                'title': book.title,
                'author': book.author.name,
                'price': str(book.price),
                'image': book.image.url if book.image else None
            } for book in books
        ]
        return JsonResponse({'books': data})
    return HttpResponseNotAllowed(['GET'])

@csrf_exempt
def api_view_book(request, book_id):
    try:
        book = Book.objects.select_related('author').get(pk=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)
    if request.method == 'GET':
        data = {
            'id': book.id,
            'title': book.title,
            'author': book.author.name,
            'price': str(book.price),
            'image': book.image.url if book.image else None
        }
        return JsonResponse(data)
    return HttpResponseNotAllowed(['GET'])

@csrf_exempt
def api_edit_book(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)
    
    if request.method in ['POST', 'PATCH', 'PUT']:
        # Handle both form data and JSON data
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                title = data.get('title')
                author_name = data.get('author')
                price = data.get('price')
                image_url = data.get('image')  # For JSON, we'll ignore image updates for now
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
        else:
            # Handle form data
            title = request.POST.get('title')
            author_name = request.POST.get('author')
            price = request.POST.get('price')
            image_url = None
        
        if title and author_name and price:
            author, _ = Author.objects.get_or_create(name=author_name)
            book.title = title
            book.author = author
            book.price = price
            if request.content_type != 'application/json' and 'image' in request.FILES:
                book.image = request.FILES['image']
            book.save()
            return JsonResponse({'success': True, 'message': 'Book updated successfully'})
        return JsonResponse({'error': 'Missing required fields'}, status=400)
    
    return HttpResponseNotAllowed(['POST', 'PATCH', 'PUT'])

@csrf_exempt
def api_delete_book(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)
    
    if request.method in ['POST', 'DELETE']:
        book.delete()
        return JsonResponse({'success': True, 'message': 'Book deleted successfully'})
    
    return HttpResponseNotAllowed(['POST', 'DELETE'])
