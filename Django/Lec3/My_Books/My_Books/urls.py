"""
URL configuration for My_Books project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from Books import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Books.urls')),
    # API endpoints - both with and without trailing slashes
    path('api/books', views.api_show_books, name='api_show_books'),
    path('api/books/', views.api_show_books, name='api_show_books_slash'),
    path('api/books/<int:book_id>', views.api_view_book, name='api_view_book'),
    path('api/books/<int:book_id>/', views.api_view_book, name='api_view_book_slash'),
    path('api/books/<int:book_id>/edit', views.api_edit_book, name='api_edit_book'),
    path('api/books/<int:book_id>/edit/', views.api_edit_book, name='api_edit_book_slash'),
    path('api/books/<int:book_id>/delete', views.api_delete_book, name='api_delete_book'),
    path('api/books/<int:book_id>/delete/', views.api_delete_book, name='api_delete_book_slash'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)