from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout, authenticate
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from .models import Project
from datetime import datetime

def home(request):
    projects = Project.objects.all().order_by('-created_at')[:6]
    total_raised = sum(project.target for project in projects)
    context = {
        'projects': projects,
        'total_raised': total_raised,
    }
    return render(request, 'fundraising/home.html', context)
def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'fundraising/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'fundraising/login.html', {'form': form})

@login_required
def logout_view(request):
    logout(request)
    return redirect('home')

@login_required
def create_project(request):
    if request.method == 'POST':
        title = request.POST['title']
        details = request.POST['details']
        target = request.POST['target']
        start_date = request.POST['start_date']
        end_date = request.POST['end_date']
        image = request.FILES.get('image')

        project = Project.objects.create(
            owner=request.user,
            title=title,
            details=details,
            target=target,
            start_date=start_date,
            end_date=end_date
        )
        
        if image:
            project.image = image
            project.save()
            
        return redirect('project_list')

    return render(request, 'fundraising/create_project.html')

@login_required
def edit_project(request, project_id):
    project = Project.objects.get(id=project_id)
    if request.user != project.owner:
        return redirect('project_list')

    if request.method == 'POST':
        project.title = request.POST['title']
        project.details = request.POST['details']
        project.target = request.POST['target']
        project.start_date = request.POST['start_date']
        project.end_date = request.POST['end_date']
        
        # Handle image upload
        if 'image' in request.FILES:
            project.image = request.FILES['image']
            
        project.save()
        return redirect('project_list')

    return render(request, 'fundraising/edit_project.html', {'project': project})
@login_required
def delete_project(request, project_id):
    project = Project.objects.get(id=project_id)
    if request.user == project.owner:
        project.delete()
    return redirect('project_list')



def project_list(request):
    projects = Project.objects.all()
    search_date = request.GET.get('date')
    if search_date:
        try:
            date_obj = datetime.strptime(search_date, '%Y-%m-%d').date()
            projects = projects.filter(start_date__lte=date_obj, end_date__gte=date_obj)
        except:
            pass
    return render(request, 'fundraising/project_list.html', {'projects': projects})
