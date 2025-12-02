"""
URL configuration for osa_partnership project.

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
from partners import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('partners.urls')),
    path('', include('partners.urls')),      # this maps root URL to partners app
    path('api/signup/', views.signup_view, name='signup'),
    path('api/login/', views.login_view, name='login'),
    path('api/current_user/', views.current_user, name='current_user'),
    path('all_partners_api/', views.all_partners_api, name='all_partners_api'),
    path("all_colleges_api/", views.all_colleges_api, name="all_colleges_api"),
    path("users/", views.get_all_users, name="get_all_users"),
]