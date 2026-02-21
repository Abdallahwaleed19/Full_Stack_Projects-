from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home'),
    path('books/', views.books, name='books'),
    path('author/', views.author, name='author'),
    path('books/<int:book_id>/', views.book_detail, name='book_detail'),
    path('books/<int:book_id>/edit/', views.book_edit, name='book_edit'),
    path('books/<int:book_id>/delete/', views.book_delete, name='book_delete'),
]
