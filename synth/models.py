from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    pass

# DB model for saving a synth preset
class Preset(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    title = models.CharField(max_length=64, default="")
    oscillatorType = models.CharField(max_length=64, default="")
    filterCutoff = models.IntegerField(default=5000)
    filterType = models.CharField(max_length=64, default="")
    attackTime = models.DecimalField(max_digits=2, decimal_places=1, default=.1)
    releaseTime = models.DecimalField(max_digits=2, decimal_places=1, default=.3)
    LFOtype = models.CharField(max_length=64, default="")
    LFOfreq = models.IntegerField(default=0)
    time = models.DateTimeField(default=timezone.now)

