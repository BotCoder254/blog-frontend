import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image,
  Type,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const { currentTenant } = useAuth();

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const handleImageUpload = async (file) => {
    if (!file || !currentTenant) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.uploadMedia(currentTenant.id, formData);
      const imageUrl = response.url;
      
      // Insert image into editor
      execCommand('insertImage', imageUrl);
      
      setShowImageUpload(false);
      setImageUrl('');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageFromUrl = () => {
    if (imageUrl) {
      execCommand('insertImage', imageUrl);
      setShowImageUpload(false);
      setImageUrl('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
  ];

  const headingButtons = [
    { icon: Type, command: 'formatBlock', value: 'h1', title: 'Heading 1', size: 'text-2xl' },
    { icon: Type, command: 'formatBlock', value: 'h2', title: 'Heading 2', size: 'text-xl' },
    { icon: Type, command: 'formatBlock', value: 'h3', title: 'Heading 3', size: 'text-lg' },
  ];

  return (
    <div className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden bg-light-input dark:bg-dark-input">
      {/* Toolbar */}
      <div className="border-b border-light-border dark:border-dark-border p-2 bg-light-surface1 dark:bg-dark-surface1">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <div className="flex items-center border-r border-light-border dark:border-dark-border pr-2 mr-2">
            {headingButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => execCommand(button.command, button.value)}
                  className={`p-2 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${button.size}`}
                  title={button.title}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              );
            })}
          </div>

          {/* Basic formatting */}
          <div className="flex items-center border-r border-light-border dark:border-dark-border pr-2 mr-2">
            {toolbarButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => execCommand(button.command, button.value)}
                  className="p-2 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  title={button.title}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              );
            })}
          </div>

          {/* Link and Image */}
          <div className="flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLinkDialog(true)}
              className="p-2 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowImageUpload(true)}
              className="p-2 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Insert Image"
            >
              <Image className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          min-h-[400px] p-4 focus:outline-none text-gray-900 dark:text-white 
          prose prose-gray dark:prose-invert max-w-none relative
          ${dragOver ? 'bg-accent-primary/5 border-accent-primary' : ''}
        `}
        style={{ 
          lineHeight: '1.6',
          fontSize: '16px'
        }}
        data-placeholder={placeholder}
      >
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent-primary/10 border-2 border-dashed border-accent-primary rounded pointer-events-none">
            <div className="text-center">
              <Upload className="w-8 h-8 text-accent-primary mx-auto mb-2" />
              <p className="text-accent-primary font-medium">Drop image here</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Insert Link
              </h3>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                >
                  Insert
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Image Upload Dialog */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Insert Image
                </h3>
                <button
                  onClick={() => {
                    setShowImageUpload(false);
                    setImageUrl('');
                  }}
                  className="p-1 hover:bg-light-hover dark:hover:bg-dark-hover rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Upload Area */}
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-light-border dark:border-dark-border rounded-lg p-8 text-center cursor-pointer hover:border-accent-primary hover:bg-accent-primary/5 transition-colors"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-500 dark:text-gray-400">
                  or
                </div>
                
                {/* URL Input */}
                <div className="space-y-3">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={insertImageFromUrl}
                    disabled={!imageUrl}
                    className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Insert from URL
                  </button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #E63946;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6B7280;
        }
        
        [contenteditable] pre {
          background: #F3F4F6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Monaco', 'Consolas', monospace;
          margin: 1rem 0;
        }
        
        .dark [contenteditable] pre {
          background: #374151;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        [contenteditable] li {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;