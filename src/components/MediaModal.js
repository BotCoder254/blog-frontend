import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Image, Trash2, Edit3, Check, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MediaModal = ({ isOpen, onClose, onSelect, allowMultiple = false }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media', user?.currentTenantId, currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        size: 20,
        type: 'image'
      });
      
      const response = await fetch(`/api/tenants/${user.currentTenantId}/media?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch media');
      return response.json();
    },
    enabled: isOpen && !!user?.currentTenantId
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/tenants/${user.currentTenantId}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId) => {
      const response = await fetch(`/api/tenants/${user.currentTenantId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ mediaId, filename }) => {
      const response = await fetch(`/api/tenants/${user.currentTenantId}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ filename })
      });
      
      if (!response.ok) throw new Error('Rename failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      setEditingId(null);
    }
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadMutation.mutate(file);
      }
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleMediaSelect = (media) => {
    if (allowMultiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.find(f => f.id === media.id);
        if (isSelected) {
          return prev.filter(f => f.id !== media.id);
        } else {
          return [...prev, media];
        }
      });
    } else {
      onSelect(media);
      onClose();
    }
  };

  const handleInsertSelected = () => {
    if (selectedFiles.length > 0) {
      onSelect(selectedFiles);
      onClose();
    }
  };

  const startEditing = (media) => {
    setEditingId(media.id);
    setEditingName(media.filename);
  };

  const handleRename = () => {
    if (editingName.trim()) {
      renameMutation.mutate({ mediaId: editingId, filename: editingName.trim() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Supports: JPG, PNG, GIF, WebP (max 10MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : mediaData?.content?.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No media files yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaData?.content?.map((media) => (
                <div
                  key={media.id}
                  className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedFiles.find(f => f.id === media.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleMediaSelect(media)}
                >
                  <img
                    src={media.thumbnailUrl || media.url}
                    alt={media.filename}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(media);
                        }}
                        className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(media.id);
                        }}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Filename */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                    {editingId === media.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-xs"
                          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                          autoFocus
                        />
                        <button
                          onClick={handleRename}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs truncate">{media.filename}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.length} file(s) selected
            </p>
            <button
              onClick={handleInsertSelected}
              disabled={selectedFiles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Insert Selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;