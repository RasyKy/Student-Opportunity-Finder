import os
import io
from PIL import Image
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

gemini = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

IMAGE_PATH = "officialdoc.jpg"  # rename to match your file

with open(IMAGE_PATH, "rb") as f:
    image_bytes = f.read()

# Convert to JPEG
img = Image.open(io.BytesIO(image_bytes))
img = img.convert("RGB")
buf = io.BytesIO()
img.save(buf, format="JPEG", quality=85)
image_bytes = buf.getvalue()

print(f"Image size: {len(image_bytes) // 1024}KB")

response = gemini.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "What text do you see in this image?"
    ]
)

finish_reason = response.candidates[0].finish_reason if response.candidates else "none"
print(f"finish_reason: {finish_reason}")
print(f"response: {response.text}")