from django.shortcuts import render, get_list_or_404
from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google import genai
from google.genai import types

def index(request):
     interest_list = ['Animals', 'Art', 'Astrology', 'Board Games', 'Business', 'Cars', 'Cooking/Baking', 'Crafts/DIYs', 'Fashion', 'Finance', 'Fitness', 'Gardening', 'History', 'Languages', 'Mindfulness', 'Music', 'Nature', 'Philanthropy', 'Photography', 'Reading', 'Space/Aviation', 'Sports', 'Technology', 'Travel', 'Video Games', 'Writing']
     tech_list = ['AI/ML', 'APIs', 'Authentication', 'AWS', 'Blockchain', 'C++', 'Containers', 'Cybersecurity', 'Data Science', 'Database', 'Firebase', 'Front End', 'Game Engine', 'Go', 'Java', 'JavaScript', 'Kotlin', 'Mobile Apps', 'Node.js', 'Python', 'Rust', 'SQL', 'Swift', 'Tailwind', 'TypeScript', 'Web Dev']
     goal_list = ['Build Skill', 'Portfolio Impact', 'Creativity']
     
     return render(request, "project_idea_generator/index.html", {"interests": interest_list, "tech": tech_list, "goals": goal_list})


@csrf_exempt
def run_prompt_view(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            prompt_string = body.get('prompt') 

            if not prompt_string:
                return JsonResponse({'error': 'Prompt is required'}, status=400)

            client = genai.Client()
            
            response = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt_string, 
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            json_output = json.loads(response.text)
            return JsonResponse(json_output, safe=False)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)