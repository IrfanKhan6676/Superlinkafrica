"use client";

import React, { useRef, useState } from "react";

export default function MultipleImageUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handlePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Multiple Image Upload Preview</h1>

        {/* Hidden Input */}
        <input
          type="file"
          id="file-input"
          ref={fileInputRef}
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handlePreview}
        />

        {/* Custom Upload Button */}
        <label
          htmlFor="file-input"
          style={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          📤 &nbsp; Choose A Photo
        </label>

        {/* Selected Count */}
        {files.length > 0 && (
          <p style={styles.fileCount}>{files.length} Files Selected</p>
        )}

        {/* Image Preview */}
        <div style={styles.imagesContainer}>
          {files.map((file, index) => {
            const imgURL = URL.createObjectURL(file);
            return (
              <figure key={index} style={styles.figure}>
                <img src={imgURL} alt={file.name} style={styles.image} />
                <figcaption style={styles.caption}>{file.name}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

//
// INLINE STYLES CONVERTED FROM YOUR CSS
//
const styles: Record<string, React.CSSProperties> = {
  body: {
    background: "radial-gradient(circle 248px at center, #16d9e3 0%, #30c7ec 47%, #46aef7 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
  },

  container: {
    backgroundColor: "#ffffff",
    width: "50%",
    minWidth: "450px",
    padding: "50px 20px",
    borderRadius: "7px",
    boxShadow: "0 20px 35px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  heading: {
    marginBottom: "20px",
    fontFamily: "Rubik, sans-serif",
  },

  uploadBtn: {
    display: "block",
    backgroundColor: "#025bee",
    color: "#ffffff",
    fontSize: "18px",
    width: "300px",
    padding: "18px 0",
    margin: "auto",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "Rubik, sans-serif",
  },

  fileCount: {
    margin: "20px 0 30px 0",
    fontFamily: "Rubik, sans-serif",
  },

  imagesContainer: {
    width: "90%",
    margin: "auto",
    display: "flex",
    justifyContent: "space-evenly",
    gap: "20px",
    flexWrap: "wrap",
  },

  figure: {
    width: "150px",
  },

  image: {
    width: "150px",
    borderRadius: "5px",
  },

  caption: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "5px",
    fontFamily: "Rubik, sans-serif",
  },
};
