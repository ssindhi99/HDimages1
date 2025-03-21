import { useState, useRef } from "react";
import "./ImageUpscaler.css";

const ImageUpscaler = () => {
  const [images, setImages] = useState([]);
  const canvasRefs = useRef({});

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => {
      const objectURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectURL;

      return new Promise((resolve) => {
        img.onload = () => {
          const minWidth = 1600;
          const minHeight = 1200;
          const scaleWidth = minWidth / img.width;
          const scaleHeight = minHeight / img.height;
          const scaleFactor = Math.max(scaleWidth, scaleHeight, 1);

          const newWidth = Math.round(img.width * scaleFactor);
          const newHeight = Math.round(img.height * scaleFactor);

          resolve({
            id: file.name + Date.now(),
            src: objectURL,
            fileType: file.type,
            fileName: file.name,
            originalSize: { width: img.width, height: img.height },
            upscaledSize: { width: newWidth, height: newHeight },
          });
        };
      });
    });

    Promise.all(newImages).then((result) => setImages([...images, ...result]));
  };

  const renderCanvas = (image) => {
    if (!canvasRefs.current[image.id]) return;

    const canvas = canvasRefs.current[image.id];
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      canvas.width = image.upscaledSize.width;
      canvas.height = image.upscaledSize.height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const downloadAllImages = () => {
    images.forEach((image) => {
      const canvas = canvasRefs.current[image.id];
      if (!canvas) return;

      const link = document.createElement("a");
      const extension = image.fileType.split("/")[1] || "png";
      const fileName = `${image.fileName.split(".")[0]}_HD.${extension}`;

      link.download = fileName;
      link.href = canvas.toDataURL(image.fileType);
      link.click();
    });
  };

  const removeAllImages = () => setImages([]);

  return (
    <div className="image-upscaler">
      {/* Buttons at the top */}
      <div className="top-buttons">
        <label className="upload-label">
          Upload Images
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        </label>

        {images.length > 0 && (
          <div className="action-buttons">
            <button className="download-btn" onClick={downloadAllImages}>Download All HD Images</button>
            <button className="remove-btn" onClick={removeAllImages}>New Images</button>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="image-list">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <div className="image-info">
                <p><strong>Original:</strong> {image.originalSize.width} x {image.originalSize.height}px</p>
                <p><strong>Upscaled:</strong> {image.upscaledSize.width} x {image.upscaledSize.height}px</p>
              </div>

              <canvas
                ref={(el) => {
                  canvasRefs.current[image.id] = el;
                  renderCanvas(image);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpscaler;
