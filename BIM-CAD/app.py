# app.py

import base64
from io import BytesIO
import google.generativeai as genai
import gradio as gr
from PIL import Image

# Set your Gemini API Key
genai.configure(api_key="AIzaSyBw7z4Pvp0iSY5vz0tP8B9mnKv9HZSnYzQ") 

def extract_floorplan_data(image):
    """Extracts floor plan data required for 3D model generation 
    using Google Gemini."""
    try:
        # Convert the image to bytes
        buffered = BytesIO()
        image.save(buffered, format="JPEG") 
        image_bytes = buffered.getvalue()

        # Prepare the image data for the API call
        image_data = base64.b64encode(image_bytes).decode("utf-8")

        # Call the model with the prompt and image data
        with open('prompt.txt','r') as file:
            prompt=file.read()
        model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        response = model.generate_content(
            [{"mime_type": "image/jpeg", "data": image_data}, prompt]
        )
        return response.text
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        return "Error processing image. See console for details."

def process_image(image):
    """Processes the image and returns the extracted floor plan data."""
    floorplan_data = extract_floorplan_data(image)

    # Pass the JSON data to the JavaScript function
    return floorplan_data, gr.HTML(
        f"""
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="index.js"></script> 
        <script>
          visualizeFloorplan('{floorplan_data}'); 
        </script>
        """
    )

# Define Gradio interface
iface = gr.Interface(
    fn=process_image,
    inputs=gr.Image(type="pil"),
    outputs=[
        gr.Textbox(lines=10, label="Extracted Floor Plan Data (JSON)"),
        gr.HTML(label="3D Visualization"), 
    ],
)
iface.launch()