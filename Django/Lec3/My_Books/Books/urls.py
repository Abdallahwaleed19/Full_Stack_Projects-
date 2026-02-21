from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home'),
    path('books/', views.books, name='books'),
    path('author/', views.author, name='author'),
    path('books/<int:book_id>/', views.book_detail, name='book_detail'),
    path('books/<int:book_id>/edit/', views.book_edit, name='book_edit'),
    path('books/<int:book_id>/delete/', views.book_delete, name='book_delete'),
    path('book/add/', views.book_add, name='book_add'),
    path('authors/add/', views.author_add, name='author_add'),
    path('authors/', views.author, name='authors'),
    path('add-author/', views.add_author, name='add_author'),
]
