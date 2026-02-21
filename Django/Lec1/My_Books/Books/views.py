from django.shortcuts import render
from django.http import HttpResponse

def home (request):
    return HttpResponse("Home Page")
def Books (request):
    return HttpResponse("Books Page")
def Author (request):
    return HttpResponse("Author Page")
