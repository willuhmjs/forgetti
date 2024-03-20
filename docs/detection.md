The failure detection feature is the most important feature of Forgetti.

## Configuration

The configuration of the detection feature is fairly straightforward, and is done almost entirely in the <i>General</i> widget of the configuration menu.

### Camera URL
* This is the URL of your camera stream.
* Forgetti only supports MJPEG streams with programs like ustreamer or mjpeg-streamer. 

### Confidence Threshold
* This is the minimum confidence required for Forgetti to respond to a failure.
* For example, a confidence threshold of 60% forces Forgetti to only respond to failures with a confidence of 60% or higher.

### Report Cooldown
* This is the amount of time Forgetti will wait before reporting a second failure.
* This is necessary to ensure that the same failure isn't reported more than once.

### Model
* This is the YOLOv8 model that Forgetti will use.
* Although beefier models may have higher mAP scores, they have higher processing times and may not work on weaker hardware.
* **Bigger does not always mean better**

{{ read_csv('models.csv') }}
