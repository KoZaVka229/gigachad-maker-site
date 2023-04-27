import base64
import io
import json
from typing import Any

from PIL import Image
from celery import shared_task
from loguru import logger

from framesmaker import FramesMaker, BoundsException, NoFramesForGifException


@shared_task
def make_gif(image_data=None, moves=None) -> dict:
    moves: dict[str, Any] = json.loads(moves)

    image_data = base64.b64decode(image_data)

    image = Image.open(io.BytesIO(image_data)).resize(moves['size'])
    maker = FramesMaker(image=image, frame_size=moves['frame_size'])
    print(moves['frame_size'])
    try:
        for move in moves.get('array', []):
            p1, p2 = move['p1'], move['p2']

            from_ = (p1['x'], p1['y'])
            to = (p2['x'], p2['y'])
            frames = move['frames']
            camsize = move['camsize']
            camsize = (camsize['width'], camsize['height'])

            logger.info(f'{from_=} {to=} {frames=} {camsize=}')
            maker.move(from_=from_, to=to, camsize=camsize, count_frames=frames)
    except BoundsException as e:
        return {'message': str(type(e))}

    with io.BytesIO() as buffer:
        try:
            maker.save_gif(buffer)
        except NoFramesForGifException as e:
            return {'message': str(type(e))}

        data = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return {'image_data_base64': data}
