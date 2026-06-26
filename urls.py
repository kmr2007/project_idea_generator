from django.urls import path

from . import views
from .views import run_prompt_view

app_name = "project_idea_generator"
urlpatterns = [
    path("", views.index, name="index"),
    path('api/run-prompt/', run_prompt_view, name='run_prompt'),
]