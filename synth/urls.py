from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('register', views.register, name='register'),
    path('login', views.loginView, name='login'),
    path('logout', views.logoutView, name='logout'),
    path('presets', views.savePreset, name='savePreset'),
    path('presets/<str:preset>', views.loadPreset, name='loadPreset')
]