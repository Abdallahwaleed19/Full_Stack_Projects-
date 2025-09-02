from django.urls import path
from . import views

urlpatterns = [
    path('',views.home,name='home'),
    path('books',views.Books,name='books'),
    path('author',views.Author,name='author'),
]
