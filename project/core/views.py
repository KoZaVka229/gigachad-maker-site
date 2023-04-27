import base64

from celery.result import AsyncResult
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect

from . import tasks
from .forms import FramesMakerForm


def make_gif(request):
    if request.POST:
        form = FramesMakerForm(request.POST, request.FILES)
        if form.is_valid():
            image = request.FILES['image']
            image_data = base64.b64encode(image.read()).decode('utf-8')

            result = tasks.make_gif.delay(image_data, form.cleaned_data['moves_json'])
            return redirect('/getgif?task_id=' + result.id)

    return render(request, 'core/makegif.html', {'form': FramesMakerForm(request.POST)})


def get_gif(request):
    task_id = request.GET.get('task_id')
    result = AsyncResult(task_id)
    if result.ready():
        result = result.result
        if image_data_base64 := result.get('image_data_base64', None):
            image_data = base64.b64decode(image_data_base64)
            return HttpResponse(image_data, content_type='image/gif')
        else:
            return JsonResponse(result)
    else:
        return HttpResponse(f"<p>Wait...</p><script>setTimeout(() => location.reload(true), {3000}); </script>")
