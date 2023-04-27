from django import forms


class IntegerField(forms.CharField):
    def __init__(self, min_: int = None, max_: int = None, attrs: dict = None):
        super().__init__(widget=forms.TextInput(
            attrs={
                'type': 'number',
                'min': str(min_) if min_ else None,
                'max': str(max_) if max_ else None,
                'class': 'form-control'} | (attrs or {}))
        )


class FramesMakerForm(forms.Form):
    image = forms.ImageField(required=True, widget=forms.FileInput(attrs={'class': 'form-control'}))
    frame_width = IntegerField(1, 500)
    frame_height = IntegerField(1, 500)
    moves_json = forms.CharField()
