import gradio as gr
import base64
import os
import uuid

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IFC.js Viewer</title>
  <style>
    html, body {{
      margin: 0; 
      padding: 0; 
      width: 100%; 
      height: 100%;
      overflow: hidden;
      background: #F0F0F0;
    }}
    #viewer-container {{
      position: absolute;
      top: 0; left: 0; 
      width: 100%; 
      height: 100%;
    }}
  </style>
</head>
<body>
  <div id="viewer-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/web-ifc@0.0.38/build/web-ifc-api.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/ifcjs-geometry@latest/IFC.js"></script>
  <script>
    const IFC_BASE64 = "{IFC_DATA}";
    function base64ToArrayBuffer(base64) {{
      const binaryString = window.atob(base64);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {{
        bytes[i] = binaryString.charCodeAt(i);
      }}
      return bytes.buffer;
    }}
    window.addEventListener('load', async () => {{
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(15, 15, 15);

      const renderer = new THREE.WebGLRenderer({{antialias: true}});
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('viewer-container').appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      const ifcLoader = new IFC.IfcLoader();
      

      const arrayBuffer = base64ToArrayBuffer(IFC_BASE64);
      const blob = new Blob([arrayBuffer], {{ type: 'application/octet-stream' }});
      const url = URL.createObjectURL(blob);

      ifcLoader.load(url, (ifcModel) => {{
        scene.add(ifcModel);
      }});

     
      function animate() {{
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }}
      animate();

     
      window.addEventListener('resize', () => {{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }});
    }});
  </script>
</body>
</html>
"""

def create_ifc_viewer_html(ifc_file: str) -> str:

    with open(ifc_file, "rb") as f:
        file_data = f.read()
        base64_str = base64.b64encode(file_data).decode("utf-8")

    return HTML_TEMPLATE.replace("{IFC_DATA}", base64_str)

def display_ifc_in_html(ifc_file) -> str:

    if not ifc_file:
        return "<p style='color:red;'>No IFC file uploaded.</p>"
    temp_path = ifc_file.name
    viewer_html = create_ifc_viewer_html(temp_path)
    return viewer_html

with gr.Blocks() as demo:
    gr.Markdown("## Gradio + IFC.js Demo\nUpload an IFC file to view it in a 3D web viewer.")

    with gr.Row():
        ifc_input = gr.File(label="Upload IFC File", file_types=[".ifc"])
    viewer_output = gr.HTML()
    ifc_input.change(fn=display_ifc_in_html, inputs=ifc_input, outputs=viewer_output)

demo.launch()
