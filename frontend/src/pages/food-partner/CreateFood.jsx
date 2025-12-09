import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../../styles/createfood.css";
import LogoutButton from "../../component/LogoutButton";

const CreateFood = () => {
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);          // 0..100
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const abortRef = useRef(null);
  const formRef = useRef(null);
  const previewUrlRef = useRef(null); // to revoke object URL

  useEffect(() => {
    // cleanup preview URL on unmount
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      setPreview(null);
      return;
    }

    // optional: basic size/type checks
    const maxMB = 200; // change if you want
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large. Max ${maxMB}MB allowed.`);
      e.target.value = "";
      setPreview(null);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      e.target.value = "";
      setPreview(null);
      return;
    }

    // revoke previous
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const videoFile = e.target.video.files?.[0];
    const name = e.target.name.value?.trim();
    const description = e.target.description.value?.trim();

    if (!videoFile) {
      setError("Please select a video first.");
      return;
    }
    if (!name) {
      setError("Please enter a meal name.");
      return;
    }

    const form = new FormData();
    form.append("video", videoFile);
    form.append("name", name);
    form.append("description", description || "");

    // prepare abort controller for cancel
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setUploading(true);
      setProgress(0);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/food`, form, {
        withCredentials: true,
        signal: controller.signal,
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);
        },
        headers: {
          // axios sets this automatically for FormData; you can omit
          "Accept": "application/json",
        },
      });

      setSuccess("Food reel uploaded successfully!");
      // reset form + preview after a short tick
      if (formRef.current) {
        formRef.current.reset();
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview(null);
      setProgress(0);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        setError("Upload cancelled.");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again.";
        setError(msg);
      }
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  return (
    <main className="createfood-page">
      <div style={{ position: "fixed", top: 1.9, right: 15, zIndex: 5000}}>
  <LogoutButton />
</div>
      <section className="createfood-card">
        <h2>Upload your food reel</h2>
        <p className="lead">Share your best meal with customers</p>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} ref={formRef}>
          {/* Video Upload */}
          <div className={`upload-box ${uploading ? "is-disabled" : ""}`}>
            <label className="upload-label">
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleVideoChange}
                required
                disabled={uploading}
              />

              {!preview ? (
                <div className="upload-placeholder">
                  <div className="upload-icon">🎥</div>
                  <p>Select or drag your food reel</p>
                </div>
              ) : (
                <video
                  className="upload-preview"
                  src={preview}
                  muted
                  playsInline
                  controls
                />
              )}
            </label>
          </div>

          {/* Name */}
          <div className="form-row">
            <label>Meal Name</label>
            <input
              name="name"
              placeholder="e.g., Paneer Butter Masala"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div className="form-row">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Short description about the meal..."
              rows="3"
              disabled={uploading}
            ></textarea>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-text">
                {progress < 100 ? `Uploading… ${progress}%` : "Finalizing…"}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelUpload}
              >
                Cancel Upload
              </button>
            </div>
          )}

          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? (
              <span className="btn-spinner">
                <span className="spinner" /> Uploading…
              </span>
            ) : (
              "Upload Food Reel"
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CreateFood;
