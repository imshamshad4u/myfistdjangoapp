from django.contrib import admin
from django.urls import path
from .import views


urlpatterns = [
    path('', views.home),
    path('streampage/',views.streampage),
    path('get_token/',views.getToken),
    path('create_member/',views.createMember),
    path('get_member/',views.getMember),
    path('delete_member/',views.deleteMember),
    path("<str:room_name>/", views.room, name="room")
]