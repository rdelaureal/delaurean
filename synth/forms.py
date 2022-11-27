from django.forms import ModelForm
from .models import Preset

# form to save a new synth preset
class PresetForm(ModelForm):
    class Meta:
        model = Preset
        fields = ['title', 'oscillatorType', 'filterCutoff', 'filterType', 'attackTime', 'releaseTime', 'LFOtype', 'LFOfreq']