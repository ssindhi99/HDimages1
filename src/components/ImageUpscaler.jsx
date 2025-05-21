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
          const minWidth = 1604;
          const minHeight = 1203;

          const originalWidth = img.width;
          const originalHeight = img.height;
          const aspectRatio = originalWidth / originalHeight;

          // Choose target aspect ratio
          let targetRatio;
          if (aspectRatio >= 1) {
            targetRatio = 4 / 3; // more width, pad to 4:3
          } else {
            targetRatio = 16 / 9; // more height, pad to 16:9
          }

          // Determine new padded dimensions
          let paddedWidth = originalWidth;
          let paddedHeight = originalHeight;

          if (aspectRatio > targetRatio) {
            // Too wide — pad height
            paddedHeight = originalWidth / targetRatio;
          } else if (aspectRatio < targetRatio) {
            // Too tall — pad width
            paddedWidth = originalHeight * targetRatio;
          }

          // Scale up to meet minimum dimensions
          const scaleWidth = minWidth / paddedWidth;
          const scaleHeight = minHeight / paddedHeight;
          const scaleFactor = Math.max(scaleWidth, scaleHeight, 1);

          const newWidth = Math.round(paddedWidth * scaleFactor);
          const newHeight = Math.round(paddedHeight * scaleFactor);

          resolve({
            id: file.name + Date.now(),
            src: objectURL,
            fileType: file.type,
            fileName: file.name,
            originalSize: { width: originalWidth, height: originalHeight },
            paddedSize: { width: paddedWidth, height: paddedHeight },
            upscaledSize: { width: newWidth, height: newHeight },
            targetRatio: targetRatio.toFixed(2),
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

      // Fill background (optional)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scaleX = image.upscaledSize.width / image.paddedSize.width;
      const scaleY = image.upscaledSize.height / image.paddedSize.height;
      const scaledImgWidth = img.width * scaleX;
      const scaledImgHeight = img.height * scaleY;

      const offsetX = (canvas.width - scaledImgWidth) / 2;
      const offsetY = (canvas.height - scaledImgHeight) / 2;

      ctx.drawImage(img, offsetX, offsetY, scaledImgWidth, scaledImgHeight);
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
                <p><strong>Original:</strong> {image.originalSize.width} × {image.originalSize.height}px</p>

                {/* style={{ display: "none" }}*/}

                <p style={{ display: "none" }}><strong>Adjusted Aspect Ratio:</strong> {image.targetRatio}</p>

                
                <p><strong>Upscaled:</strong> {image.upscaledSize.width} × {image.upscaledSize.height}px</p>
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
