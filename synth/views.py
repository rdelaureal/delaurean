from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.forms.models import model_to_dict


from .models import User, Preset
from .forms import PresetForm


def index(request):

    if request.user.is_authenticated:
        # get user details
        user = User.objects.get(pk=request.user.id)
        presets = Preset.objects.filter(creator=user)
        return render(request, "synth/index.html", {
            "presets": presets
        })
    else:
        return render(request, "synth/index.html")

def about(request):
    return render(request, "synth/about.html")

def savePreset(request):

    # get user details
    user = User.objects.get(pk=request.user.id)

    # POST request: new preset was saved
    if request.method == "POST":

        form = PresetForm(request.POST)

        if form.is_valid():
            newPreset = form.save(commit=False)
            newPreset.creator = user
            newPreset.save()
            return HttpResponse(status=204)
        
        else:
            return HttpResponse(status=400)

    else:
        return HttpResponseRedirect(reverse("index"))

def loadPreset(request, preset):

    print(preset)
    
    # get user details
    user = User.objects.get(pk=request.user.id)

    # Query for requested preset
    try:
        presetDetails = Preset.objects.get(creator=user, title=preset)
    except Preset.DoesNotExist:
        return JsonResponse({"error": "Preset not found."}, status=404)

    # Return preset details
    if request.method == "GET":
        data = model_to_dict(presetDetails)
        print(data)
        return JsonResponse(data)


def loginView(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "synth/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "synth/login.html")


def logoutView(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        
        # get user data from POST request
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "synth/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "synth/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "synth/register.html")
