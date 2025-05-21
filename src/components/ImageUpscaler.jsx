import { useState, useRef, useEffect } from "react";
import "./ImageUpscaler.css";
import { FiUploadCloud } from "react-icons/fi";

const ImageUpscaler = () => {
  const [images, setImages] = useState([]);
  const canvasRefs = useRef({});

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const newImages = fileArray.map((file) => {
      return new Promise((resolve) => {
        const objectURL = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectURL;
        img.onload = () => {
          const scaleFactor = Math.max(1604 / img.width, 1203 / img.height, 1);
          resolve({
            id: file.name + Date.now(),
            src: objectURL,
            fileType: file.type,
            fileName: file.name,
            originalSize: { width: img.width, height: img.height },
            upscaledSize: {
              width: Math.round(img.width * scaleFactor),
              height: Math.round(img.height * scaleFactor),
            },
          });
        };
      });
    });

    Promise.all(newImages).then((result) =>
      setImages((prev) => [...prev, ...result])
    );
  };

  const handleImageUpload = (event) => handleFiles(event.target.files);
  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const renderCanvas = (image) => {
    const canvas = canvasRefs.current[image.id];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 100;
    const img = new Image();
    img.src = image.src;
    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  useEffect(() => {
    images.forEach(renderCanvas);
  }, [images]);

  const downloadAllImages = () => {
    images.forEach((image) => {
      const offscreenCanvas = document.createElement("canvas");
      const ctx = offscreenCanvas.getContext("2d");
      offscreenCanvas.width = image.upscaledSize.width;
      offscreenCanvas.height = image.upscaledSize.height;
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCanvas.toBlob((blob) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${image.fileName.split(".")[0]}_HD.${
            image.fileType.split("/")[1] || "png"
          }`;
          link.click();
          URL.revokeObjectURL(link.href);
        }, image.fileType);
      };
    });
  };

  
  return (
    <div
      className="image-upscaler"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="drop-zone">
        <FiUploadCloud className="upload-icon" />
        <p>Drag & Drop or Click to Select Images</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="file-input"
        />
      </div>

      {images.length > 0 && (
        <div className="action-buttons">
          <button className="download-btn" onClick={downloadAllImages}>
            Download All HD Images
          </button>
          <button className="remove-btn" onClick={() => setImages([])}>
            New Images
          </button>
        </div>
      )}

      <div className="image-list">
        {images.map((image) => (
          <div key={image.id} className="image-card">
            <div className="image-info">
              <p>
                <strong>Original:</strong> {image.originalSize.width} x{" "}
                {image.originalSize.height}px
              </p>
              <p>
                <strong>Upscaled:</strong> {image.upscaledSize.width} x{" "}
                {image.upscaledSize.height}px
              </p>
            </div>
            <canvas ref={(el) => (canvasRefs.current[image.id] = el)} />
          </div>
        ))}
      </div>
    </div>
  );
};



export default ImageUpscaler;
