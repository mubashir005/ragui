"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, File as FileIcon, FileText } from "lucide-react";

interface FileUploadDialogProps {
  show: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export default function FileUploadDialog({ show, onClose, onUpload }: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 1; // Only allow 1 file

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Only take the first file
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, MAX_FILES);
    setFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    // Only take the first file
    const selectedFiles = Array.from(e.target.files).slice(0, MAX_FILES);
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) =>
    setFiles(prev => prev.filter((_, i) => i !== index));

  const handleUploadClick = () => {
    if (!files.length) return;
    onUpload(files);
    setFiles([]);
    onClose();
  };

  const handleCloseClick = () => {
    setFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-red-400" />;
    if (ext === "doc" || ext === "docx")
      return <FileText className="w-5 h-5 text-blue-400" />;
    if (ext === "md") return <FileIcon className="w-5 h-5 text-green-400" />;
    return <FileIcon className="w-5 h-5 text-cyan-400" />;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseClick}
      >
        <motion.div
          className="bg-slate-800/95 border-2 border-cyan-400/60 rounded-3xl p-8 w-full max-w-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Upload Document
                </h2>
                <p className="text-sm text-slate-400">
                  Add one file to start the pipeline
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseClick}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"
            >
              <X />
            </button>
          </div>

          {/* Drop Zone */}
          <motion.div
            className={`border-2 border-dashed rounded-2xl p-10 mb-6 text-center transition-colors ${
              isDragging
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-slate-600 bg-slate-900/40"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-14 h-14 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-200">
              Drag & drop a file
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              PDF, DOCX, MD, TXT (one file only)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.md,.txt"
              onChange={handleFileSelect}
              hidden
            />
          </motion.div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-2 mb-6 max-h-56 overflow-y-auto">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="truncate">
                      <p className="text-sm text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCloseClick}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadClick}
              disabled={!files.length}
              className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
                files.length
                  ? "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                  : "bg-slate-700 opacity-50 cursor-not-allowed"
              }`}
            >
              {files.length ? "Upload Document" : "Select a file"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
