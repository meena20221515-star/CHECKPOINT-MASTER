import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
  RemoveRedEye as ViewIcon,
} from '@mui/icons-material';

const API_BASE = 'http://localhost:5000/api';

// ========== VIEW CHECKPOINT DIALOG ==========
const ViewCheckpointDialog = ({ open, onClose, checkpoint, handleViewFile, handleDownloadFile }) => {
  if (!checkpoint) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>View Checkpoint Details</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{checkpoint.name || 'N/A'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Todos</Typography>
              <Box sx={{ mb: 2 }}>
                {checkpoint.todos && checkpoint.todos.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {checkpoint.todos.map((todo, index) => (
                      <Box key={index} sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2">{index + 1}. {todo}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No todos</Typography>
                )}
              </Box>

              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{formatDate(checkpoint.date)}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Uploaded Files</Typography>
              {checkpoint.files && checkpoint.files.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {checkpoint.files.map((file, index) => (
                      <ListItem key={index} divider={index < checkpoint.files.length - 1} secondaryAction={
                        <Box>
                          <IconButton size="small" onClick={() => handleViewFile(file)} title="View File" sx={{ mr: 1 }}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDownloadFile(file)} title="Download File">
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      }>
                        <AttachFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={file.originalname || file.filename}
                          secondary={`${formatFileSize(file.size)} • ${formatDate(file.uploadDate)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No files uploaded</Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== FILES DIALOG ==========
const FilesDialog = ({ 
  open, 
  onClose, 
  checkpoint, 
  files, 
  handleViewFile, 
  handleDownloadFile,
  handleDeleteFile 
}) => {
  // FIXED: ESLint warning resolved - 'i' is defined before use
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon />
          Files for {checkpoint?.name || 'Checkpoint'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {files.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No files uploaded
            </Typography>
          ) : (
            <List>
              {files.map((file, index) => (
                <ListItem 
                  key={index} 
                  divider={index < files.length - 1} 
                  secondaryAction={
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewFile(file)} 
                        title="View File" 
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadFile(file)} 
                        title="Download File" 
                        sx={{ mr: 1 }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteFile(index, true)} 
                        title="Delete File" 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <AttachFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={file.originalname || file.filename}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(file.uploadDate || Date.now()).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== EDIT CHECKPOINT DIALOG ==========
const EditCheckpointDialog = ({
  open,
  onClose,
  checkpoint,
  onSave,
  formData,
  setFormData,
  todos,
  setTodos,
  uploadedFiles,
  setUploadedFiles,
  handleViewFile,
  handleDownloadFile,
  handleDeleteFile,
  handleAddNewFiles,
  editingTodoIndex,
  setEditingTodoIndex,
  editingTodoText,
  setEditingTodoText,
  handleStartEditTodo,
  handleSaveEditTodo,
  handleCancelEditTodo,
  handleRemoveTodo,
  handleAddTodo,
  isSubmitting,
}) => {
  const [newFiles, setNewFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // ========== MULTIPLE FILE HANDLER - APPENDS ==========
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setNewFiles(prevFiles => [...prevFiles, ...files]); // APPENDS, not overwrites
    event.target.value = ''; // Clear input
  };

  const handleAddFiles = async () => {
    if (newFiles.length === 0) {
      alert('Please select files first');
      return;
    }

    setIsUploading(true);
    try {
      await handleAddNewFiles(newFiles);
      setNewFiles([]);
    } catch (error) {
      console.error('Error adding files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTodoInputChange = (e) => {
    setFormData(prev => ({ ...prev, todoInput: e.target.value }));
  };

  const handleSubmit = () => {
    onSave();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Checkpoint</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Name *" 
                name="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                sx={{ mb: 2 }} 
                disabled={isSubmitting} 
              />
              <TextField 
                fullWidth 
                label="Todo *" 
                placeholder="Add a todo..." 
                name="todoInput" 
                value={formData.todoInput} 
                onChange={handleTodoInputChange} 
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()} 
                InputProps={{ 
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={handleAddTodo} 
                        color="success" 
                        sx={{ bgcolor: 'success.main', color: 'white' }} 
                        disabled={isSubmitting}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }} 
                sx={{ mb: 2 }} 
                disabled={isSubmitting} 
              />
              <TextField 
                fullWidth 
                label="Date *" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleFormChange} 
                InputLabelProps={{ shrink: true }} 
                sx={{ mb: 3 }} 
                disabled={isSubmitting} 
              />
              
              {/* File Upload Section */}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  fullWidth
                  disabled={isSubmitting || isUploading}
                >
                  Add More Files
                  <input 
                    type="file" 
                    hidden 
                    multiple 
                    onChange={handleFileSelect} 
                    disabled={isSubmitting || isUploading}
                  />
                </Button>
                
                {newFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {newFiles.length} file(s) selected
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {newFiles.slice(0, 3).map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          size="small"
                          sx={{ mr: 1, mt: 1 }}
                          onDelete={() => {
                            setNewFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddFiles}
                      sx={{ mt: 1 }}
                      disabled={isSubmitting || isUploading}
                    >
                      {isUploading ? 'UPLOADING...' : 'Upload Selected Files'}
                    </Button>
                  </Box>
                )}
                
                {isUploading && <LinearProgress sx={{ mt: 1 }} />}
              </Box>

              {/* Existing Files List */}
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Existing Files:
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {uploadedFiles.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{ 
                          py: 0.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                        secondaryAction={
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleViewFile(file)}
                              title="View File"
                              disabled={isSubmitting}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(file)}
                              title="Download File"
                              disabled={isSubmitting}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteFile(index, false)}
                              title="Delete File"
                              color="error"
                              disabled={isSubmitting}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={file.originalname || file.filename}
                          secondary={`Size: ${file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>Todo Preview</Typography>
              {todos.length > 0 ? (
                <Card variant="outlined">
                  <CardContent sx={{ py: 1, maxHeight: 150, overflow: 'auto' }}>
                    <List dense>
                      {todos.map((todo, index) => (
                        <ListItem key={index} divider={index < todos.length - 1} sx={{ py: 0.5 }}>
                          {editingTodoIndex === index ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <TextField 
                                fullWidth 
                                size="small" 
                                value={editingTodoText} 
                                onChange={(e) => setEditingTodoText(e.target.value)} 
                                onKeyPress={(e) => { 
                                  if (e.key === 'Enter') handleSaveEditTodo(index); 
                                  if (e.key === 'Escape') handleCancelEditTodo(); 
                                }} 
                                autoFocus 
                                disabled={isSubmitting} 
                              />
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleSaveEditTodo(index)} 
                                disabled={isSubmitting}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={handleCancelEditTodo} 
                                disabled={isSubmitting}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <>
                              <ListItemText primary={todo} />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleStartEditTodo(index, todo)} 
                                  disabled={isSubmitting}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleRemoveTodo(index)} 
                                  disabled={isSubmitting}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Click + icon to add todos to preview</Typography>
                </Box>
              )}

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>Files Preview</Typography>
              {uploadedFiles.length > 0 ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{uploadedFiles.length} file(s) uploaded</Typography>
                    <Box sx={{ mt: 1 }}>
                      {uploadedFiles.slice(0, 3).map((file, index) => (
                        <Chip
                          key={index}
                          label={file.originalname || file.filename}
                          size="small"
                          sx={{ mr: 1, mt: 1 }}
                          onDelete={() => handleDeleteFile(index, false)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No files uploaded</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'UPDATING...' : 'Update Checkpoint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== FILE PREVIEW DIALOG ==========
const FilePreviewDialog = ({ open, onClose, file, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Get file extension
  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  };

  const extension = getFileExtension(file?.name || file?.originalname || '');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  const isPDF = extension === 'pdf';
  const isText = ['txt', 'csv', 'json', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'md'].includes(extension);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon />
          {file?.name || file?.originalname || 'File Preview'}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: '500px', p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
            <Typography>Loading file preview...</Typography>
          </Box>
        )}
        
        {error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '500px', p: 3 }}>
            <Typography color="error" sx={{ mb: 2 }}>
              Unable to preview this file type
            </Typography>
            <Button 
              variant="contained" 
              component="a" 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Open in New Tab
            </Button>
          </Box>
        ) : (
          <>
            {isImage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
                <img 
                  src={fileUrl} 
                  alt={file?.name || 'Preview'} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </Box>
            )}
            
            {isPDF && (
              <Box sx={{ height: '500px' }}>
                <iframe 
                  src={fileUrl} 
                  title={file?.name || 'PDF Preview'}
                  width="100%" 
                  height="100%"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ border: 'none' }}
                />
              </Box>
            )}
            
            {isText && (
              <Box sx={{ height: '500px', p: 2 }}>
                <iframe 
                  src={fileUrl} 
                  title={file?.name || 'Text Preview'}
                  width="100%" 
                  height="100%"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ border: 'none' }}
                />
              </Box>
            )}
            
            {!isImage && !isPDF && !isText && (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '500px', p: 3 }}>
                <Typography sx={{ mb: 2 }}>
                  Preview not available for this file type (.{extension})
                </Typography>
                <Button 
                  variant="contained" 
                  component="a" 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Open in New Tab
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          component="a" 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          download={file?.name || file?.originalname}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== MAIN CHECKPOINT MASTER COMPONENT ==========
const CheckpointMaster = () => {
  const [checkpoints, setCheckpoints] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [selectedRowFiles, setSelectedRowFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    todoInput: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [todos, setTodos] = useState([]);
  const [editingTodoIndex, setEditingTodoIndex] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState('');

  // Load checkpoints on component mount
  useEffect(() => { 
    const loadCheckpoints = async () => {
      try {
        const response = await fetch(`${API_BASE}/checkpoints`);
        if (!response.ok) throw new Error('Failed to fetch checkpoints');
        const data = await response.json();
        
        // ✅ FIX 1: Sort by creation date (oldest first) for correct serial numbers
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateA - dateB; // Ascending order (oldest first)
        });
        
        // ✅ FIX 2: Assign serial numbers in correct order (1,2,3...)
        const dataWithSno = sortedData.map((item, index) => ({ 
          ...item, 
          sno: index + 1 
        }));
        
        setCheckpoints(dataWithSno);
      } catch (error) {
        console.error('Error fetching checkpoints:', error);
        showSnackbar('Failed to fetch checkpoints', 'error');
      }
    };

    loadCheckpoints();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCheckpoints = async () => {
    try {
      const response = await fetch(`${API_BASE}/checkpoints`);
      if (!response.ok) throw new Error('Failed to fetch checkpoints');
      const data = await response.json();
      
      // ✅ FIX 1: Sort by creation date (oldest first) for correct serial numbers
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateA - dateB; // Ascending order (oldest first)
      });
      
      // ✅ FIX 2: Assign serial numbers in correct order (1,2,3...)
      const dataWithSno = sortedData.map((item, index) => ({ 
        ...item, 
        sno: index + 1 
      }));
      
      setCheckpoints(dataWithSno);
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      showSnackbar('Failed to fetch checkpoints', 'error');
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/checkpoints/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('File upload failed');
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deleteFileFromServer = async (filePath, checkpointId = null) => {
    try {
      const response = await fetch(`${API_BASE}/checkpoints/delete-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, checkpointId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting file from server:', error);
      return false;
    }
  };

  const handleSearchChange = (event) => setSearchText(event.target.value);

  const filteredCheckpoints = useMemo(() => {
    if (!searchText.trim()) return checkpoints;
    
    const searchLower = searchText.toLowerCase();
    return checkpoints.filter((checkpoint) => {
      const nameMatch = checkpoint.name && checkpoint.name.toLowerCase().includes(searchLower);
      const todoMatch = checkpoint.todos && checkpoint.todos.some(todo => todo.toLowerCase().includes(searchLower));
      const dateMatch = checkpoint.date && new Date(checkpoint.date).toLocaleDateString().toLowerCase().includes(searchLower);
      return nameMatch || todoMatch || dateMatch;
    });
  }, [checkpoints, searchText]);

  // ========== MULTIPLE FILE SELECTION HANDLER ==========
  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files || []);
    console.log('New files selected:', newFiles.length, 'files:', newFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })));
    
    // ✅ APPEND new files to existing files (NOT overwrite)
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Clear input to allow selecting same files again
    event.target.value = '';
  };

  // ========== VIEW SELECTED FILE (FROM FORM PREVIEW) ==========
  const handleViewSelectedFile = (file) => {
    if (file) {
      // Create object URL for local file
      const fileUrl = URL.createObjectURL(file);
      setPreviewFile(file);
      setPreviewFileUrl(fileUrl);
      setPreviewDialogOpen(true);
    }
  };

  // ========== DOWNLOAD SELECTED FILE (FROM FORM PREVIEW) ==========
  const handleDownloadSelectedFile = (file) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
    }
  };

  const handleTodoInputChange = (e) => {
    setFormData(prev => ({ ...prev, todoInput: e.target.value }));
  };

  const handleAddTodo = () => {
    if (formData.todoInput.trim()) {
      setTodos(prev => [...prev, formData.todoInput.trim()]);
      setFormData(prev => ({ ...prev, todoInput: '' }));
    }
  };

  const handleRemoveTodo = (index) => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartEditTodo = (index, currentText) => { 
    setEditingTodoIndex(index); 
    setEditingTodoText(currentText); 
  };

  const handleSaveEditTodo = (index) => {
    if (editingTodoText.trim()) {
      const newTodos = [...todos];
      newTodos[index] = editingTodoText.trim();
      setTodos(newTodos);
    }
    setEditingTodoIndex(null);
    setEditingTodoText('');
  };

  const handleCancelEditTodo = () => { 
    setEditingTodoIndex(null); 
    setEditingTodoText(''); 
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ========== MULTIPLE FILE UPLOAD FUNCTION ==========
  const handleSaveCheckpoint = async () => {
    console.log('=== SAVING CHECKPOINT STARTED ===');
    console.log('Selected files count:', selectedFiles.length);
    console.log('Selected files:', selectedFiles.map(f => f.name));
    
    if (!formData.name.trim()) {
      showSnackbar('Please enter a name for the checkpoint', 'error');
      return;
    }
    
    if (todos.length === 0) {
      showSnackbar('Please add at least one todo', 'error');
      return;
    }
    
    if (!formData.date) {
      showSnackbar('Please select a date', 'error');
      return;
    }

    if (selectedFiles.length === 0) {
      showSnackbar('Please select at least one file', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('todos', JSON.stringify(todos));
      formDataToSend.append('date', formData.date);
      
      // ✅ CORRECT: Append ALL selected files with SAME key 'files'
      selectedFiles.forEach((file, index) => {
        console.log(`Appending file ${index + 1}: ${file.name}`);
        formDataToSend.append('files', file);  // KEY: 'files' (plural) - SAME for all
      });

      console.log('Sending to:', `${API_BASE}/checkpoints`);
      
      // Send to /checkpoints (NOT /checkpoints/upload)
      const response = await fetch(`${API_BASE}/checkpoints`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(errorText || 'Failed to save checkpoint');
      }

      const savedCheckpoint = await response.json();
      console.log('Checkpoint saved:', savedCheckpoint);
      showSnackbar(`Checkpoint "${savedCheckpoint.name}" saved successfully with ${savedCheckpoint.files?.length || 0} files!`, 'success');
      
      // Reset form
      setFormData({ 
        name: '', 
        todoInput: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setTodos([]);
      setSelectedFiles([]);
      setUploadedFiles([]);
      setEditingTodoIndex(null);
      setEditingTodoText('');
      
      // ✅ FIX 3: Refresh checkpoints to show new record at BOTTOM
      fetchCheckpoints();
      
    } catch (error) {
      console.error('Error saving checkpoint:', error);
      showSnackbar(`Failed to save checkpoint: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCheckpoint = (checkpoint) => { 
    setSelectedCheckpoint(checkpoint); 
    setViewDialogOpen(true); 
  };

  const handleViewFiles = (checkpoint) => { 
    setSelectedCheckpoint(checkpoint); 
    setSelectedRowFiles(checkpoint.files || []); 
    setFilesDialogOpen(true); 
  };

  const handleEditCheckpoint = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    
    setFormData({
      name: checkpoint.name || '',
      todoInput: '',
      date: checkpoint.date ? new Date(checkpoint.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    
    setTodos(checkpoint.todos || []);
    setUploadedFiles(checkpoint.files || []);
    setEditDialogOpen(true);
  };

  const handleDeleteCheckpoint = async (id) => {
    if (window.confirm('Are you sure you want to delete this checkpoint? All associated files will also be deleted.')) {
      try {
        const response = await fetch(`${API_BASE}/checkpoints/${id}`, { 
          method: 'DELETE' 
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete checkpoint');
        }
        
        fetchCheckpoints();
        showSnackbar('Checkpoint deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting checkpoint:', error);
        showSnackbar('Failed to delete checkpoint', 'error');
      }
    }
  };

  const handleUpdateCheckpoint = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Please enter a name for the checkpoint', 'error');
      return;
    }
    
    if (todos.length === 0) {
      showSnackbar('Please add at least one todo', 'error');
      return;
    }
    
    if (!formData.date) {
      showSnackbar('Please select a date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedCheckpoint && (selectedCheckpoint._id || selectedCheckpoint.id)) {
        const id = selectedCheckpoint._id || selectedCheckpoint.id;
        
        const updateData = {
          name: formData.name.trim(),
          todos: todos,
          date: formData.date,
          files: uploadedFiles
        };
        
        const response = await fetch(`${API_BASE}/checkpoints/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update checkpoint');
        }
        
        showSnackbar('Checkpoint updated successfully!', 'success');
        fetchCheckpoints();
        setEditDialogOpen(false);
        
        setFormData({ 
          name: '', 
          todoInput: '', 
          date: new Date().toISOString().split('T')[0] 
        });
        setTodos([]);
        setUploadedFiles([]);
        setSelectedFiles([]);
        setEditingTodoIndex(null);
        setEditingTodoText('');
      }
    } catch (error) {
      console.error('Error updating checkpoint:', error);
      showSnackbar(`Failed to update checkpoint: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewFile = (file) => {
    if (file.path) {
      const fileUrl = file.path.startsWith('/uploads') 
        ? `http://localhost:5000${file.path}`
        : file.path;
      window.open(fileUrl, '_blank');
    } else {
      showSnackbar('File path not available', 'warning');
    }
  };

  const handleDownloadFile = (file) => {
    if (file.path) {
      const fileUrl = file.path.startsWith('/uploads') 
        ? `http://localhost:5000${file.path}`
        : file.path;
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.originalname || file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showSnackbar('File path not available', 'warning');
    }
  };

  const handleDeleteFile = async (index, isFromTable = false) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const fileToDelete = isFromTable ? selectedRowFiles[index] : uploadedFiles[index];
      
      if (fileToDelete && fileToDelete.path) {
        const success = await deleteFileFromServer(fileToDelete.path, selectedCheckpoint?._id);
        if (success) {
          if (isFromTable) {
            const updatedFiles = selectedRowFiles.filter((_, i) => i !== index);
            setSelectedRowFiles(updatedFiles);
            
            if (selectedCheckpoint) {
              const updateData = {
                ...selectedCheckpoint,
                files: updatedFiles
              };
              
              const response = await fetch(`${API_BASE}/checkpoints/${selectedCheckpoint._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
              });
              
              if (response.ok) {
                fetchCheckpoints();
              }
            }
          } else {
            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
          }
          showSnackbar('File deleted successfully!', 'success');
        } else {
          showSnackbar('Failed to delete file', 'error');
        }
      }
    }
  };

  const handleAddNewFiles = async (files) => {
    const uploadPromises = files.map(file => uploadFile(file));
    
    try {
      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedResults]);
      showSnackbar(`${uploadedResults.length} files uploaded successfully!`, 'success');
      return uploadedResults;
    } catch (error) {
      console.error('Error uploading new files:', error);
      showSnackbar('Failed to upload some files', 'error');
      throw error;
    }
  };

  // ========== FIXED COLUMNS WITH AUTO EXPANDING ROWS ==========
  const columns = [
    { 
      field: 'sno', 
      headerName: 'S.No', 
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1, 
      minWidth: 150,
      cellClassName: 'cell-wrap-text',
    },
    { 
      field: 'todos', 
      headerName: 'Todos', 
      flex: 1, 
      minWidth: 200,
      // ✅ FIX 4: Auto expanding todos with wrapping
      renderCell: (params) => {
        const todos = params.value || [];
        return (
          <Box 
            sx={{ 
              width: '100%', 
              py: 1,
              maxHeight: 'none', // Allow full height
            }}
          >
            {todos.map((todo, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  display: 'block', 
                  mb: 0.5,
                  whiteSpace: 'normal', // Allow wrapping
                  wordBreak: 'break-word', // Break long words
                  lineHeight: 1.5,
                }}
              >
                • {todo}
              </Typography>
            ))}
          </Box>
        );
      },
      cellClassName: 'cell-wrap-text',
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      flex: 1, 
      minWidth: 150, 
      valueFormatter: (params) => !params.value ? '' : new Date(params.value).toLocaleDateString() 
    },
    { 
      field: 'files', 
      headerName: 'Files', 
      width: 180, 
      renderCell: (params) => {
        const files = params.row.files || [];
        const fileCount = files.length;
        
        return (
          <Box sx={{ width: '100%' }}>
            {fileCount > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon fontSize="small" color="action" />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleViewFiles(params.row)} 
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  {fileCount} file{fileCount !== 1 ? 's' : ''}
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No files</Typography>
            )}
          </Box>
        );
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150, 
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleViewCheckpoint(params.row)} 
            title="View"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleEditCheckpoint(params.row)} 
            title="Edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleDeleteCheckpoint(params.row._id)} 
            title="Delete" 
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Checkpoint Master
      </Typography>

      {/* TOP FORM */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Left column: Name, Todo, Date */}
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Name *" 
              name="name" 
              value={formData.name} 
              onChange={handleFormChange} 
              sx={{ mb: 2 }} 
              disabled={isSubmitting} 
            />
            <TextField 
              fullWidth 
              label="Todo *" 
              name="todoInput" 
              value={formData.todoInput} 
              onChange={handleTodoInputChange} 
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()} 
              InputProps={{ 
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={handleAddTodo} 
                      color="success" 
                      sx={{ bgcolor: 'success.main', color: 'white' }} 
                      disabled={isSubmitting}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }} 
              sx={{ mb: 2 }} 
              disabled={isSubmitting} 
            />
            <TextField 
              fullWidth 
              label="Date *" 
              name="date" 
              type="date" 
              value={formData.date} 
              onChange={handleFormChange} 
              InputLabelProps={{ shrink: true }} 
              sx={{ mb: 2 }} 
              disabled={isSubmitting} 
            />

            {/* ========== MULTIPLE FILE INPUT ========== */}
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              component="label"
              fullWidth
              sx={{ mb: 2 }}
              disabled={isSubmitting}
            >
              SELECT FILES
              <input 
                type="file" 
                hidden 
                multiple // ✅ MULTIPLE FILES
                onChange={handleFileSelect} 
                disabled={isSubmitting}
              />
            </Button>
            
            {/* ========== MULTIPLE FILE PREVIEW WITH VIEW FUNCTION ========== */}
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Selected Files Preview ({selectedFiles.length} files):
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {selectedFiles.map((file, index) => (
                      <ListItem 
                        key={index} 
                        divider={index < selectedFiles.length - 1}
                        sx={{ py: 1 }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* VIEW BUTTON */}
                            <Tooltip title="View File">
                              <IconButton 
                                size="small" 
                                edge="end"
                                onClick={() => handleViewSelectedFile(file)}
                                disabled={isSubmitting}
                                color="primary"
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* DOWNLOAD BUTTON */}
                            <Tooltip title="Download File">
                              <IconButton 
                                size="small" 
                                edge="end"
                                onClick={() => handleDownloadSelectedFile(file)}
                                disabled={isSubmitting}
                                color="info"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* REMOVE BUTTON */}
                            <Tooltip title="Remove File">
                              <IconButton 
                                size="small" 
                                edge="end"
                                onClick={() => {
                                  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                }}
                                disabled={isSubmitting}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <AttachFileIcon fontSize="small" sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {file.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Size: {(file.size / 1024).toFixed(2)} KB
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {file.type || 'Unknown'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Right column: Todo Preview */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
              Todo Preview
            </Typography>
            {todos.length > 0 ? (
              <Card variant="outlined">
                <CardContent sx={{ py: 1, maxHeight: 150, overflow: 'auto' }}>
                  <List dense>
                    {todos.map((todo, index) => (
                      <ListItem key={index} divider={index < todos.length - 1} sx={{ py: 0.5 }}>
                        {editingTodoIndex === index ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <TextField 
                              fullWidth 
                              size="small" 
                              value={editingTodoText} 
                              onChange={(e) => setEditingTodoText(e.target.value)} 
                              onKeyPress={(e) => { 
                                if (e.key === 'Enter') handleSaveEditTodo(index); 
                                if (e.key === 'Escape') handleCancelEditTodo(); 
                              }} 
                              autoFocus 
                              disabled={isSubmitting} 
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => handleSaveEditTodo(index)} 
                              disabled={isSubmitting}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={handleCancelEditTodo} 
                              disabled={isSubmitting}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <>
                            <ListItemText primary={todo} />
                            <ListItemSecondaryAction>
                              <IconButton 
                                size="small" 
                                onClick={() => handleStartEditTodo(index, todo)} 
                                disabled={isSubmitting}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveTodo(index)} 
                                disabled={isSubmitting}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ 
                border: '1px dashed', 
                borderColor: 'divider', 
                borderRadius: 1, 
                p: 3, 
                textAlign: 'center' 
              }}>
                <Typography variant="body2" color="text.secondary">
                  Add todos using + button
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Buttons row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSaveCheckpoint} 
            disabled={isSubmitting || selectedFiles.length === 0}
            sx={{ width: '48%' }}
          >
            {isSubmitting ? 'SAVING...' : `SAVE CHECKPOINT (${selectedFiles.length} files)`}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => { 
              setFormData({ 
                name: '', 
                todoInput: '', 
                date: new Date().toISOString().split('T')[0] 
              }); 
              setTodos([]); 
              setSelectedFiles([]); // ✅ Reset to empty array
              setUploadedFiles([]);
              setEditingTodoIndex(null); 
              setEditingTodoText(''); 
            }} 
            sx={{ width: '48%' }} 
            disabled={isSubmitting}
          >
            CLEAR FORM
          </Button>
        </Box>
      </Paper>

      {/* SEARCH BAR */}
      <Box sx={{ mb: 2 }}>
        <TextField 
          fullWidth 
          placeholder="Search by Name, Todo, or Date..." 
          variant="outlined" 
          size="small" 
          value={searchText} 
          onChange={handleSearchChange} 
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ) 
          }} 
        />
      </Box>

      {/* ========== FIXED DATA GRID WITH AUTO EXPANDING ROWS ========== */}
      <Box sx={{ height: 'auto', width: '100%' }}>
        <DataGrid 
          rows={filteredCheckpoints} 
          columns={columns} 
          pageSize={10} 
          rowsPerPageOptions={[10, 25, 50]} 
          disableSelectionOnClick 
          getRowId={(row) => row._id}
          // ✅ FIX 5: Auto row height configuration
          getRowHeight={() => 'auto'} // Auto height for all rows
          sx={{
            // ✅ FIX 6: CSS for wrapping text in cells
            '& .cell-wrap-text': {
              whiteSpace: 'normal !important',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            },
            '& .MuiDataGrid-cell': {
              py: 1, // Add padding for better spacing
            },
          }}
        />
      </Box>

      {/* DIALOGS */}
      {selectedCheckpoint && (
        <>
          <ViewCheckpointDialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)} 
            checkpoint={selectedCheckpoint} 
            handleViewFile={handleViewFile} 
            handleDownloadFile={handleDownloadFile} 
          />
          
          <EditCheckpointDialog 
            open={editDialogOpen} 
            onClose={() => { 
              setEditDialogOpen(false); 
              setEditingTodoIndex(null); 
              setEditingTodoText(''); 
            }} 
            checkpoint={selectedCheckpoint} 
            onSave={handleUpdateCheckpoint} 
            formData={formData} 
            setFormData={setFormData} 
            todos={todos} 
            setTodos={setTodos} 
            uploadedFiles={uploadedFiles} 
            setUploadedFiles={setUploadedFiles} 
            handleViewFile={handleViewFile} 
            handleDownloadFile={handleDownloadFile} 
            handleDeleteFile={handleDeleteFile} 
            handleAddNewFiles={handleAddNewFiles} 
            editingTodoIndex={editingTodoIndex} 
            setEditingTodoIndex={setEditingTodoIndex} 
            editingTodoText={editingTodoText} 
            setEditingTodoText={setEditingTodoText} 
            handleStartEditTodo={handleStartEditTodo} 
            handleSaveEditTodo={handleSaveEditTodo} 
            handleCancelEditTodo={handleCancelEditTodo} 
            handleRemoveTodo={handleRemoveTodo} 
            handleAddTodo={handleAddTodo} 
            isSubmitting={isSubmitting} 
          />
          
          <FilesDialog 
            open={filesDialogOpen} 
            onClose={() => setFilesDialogOpen(false)} 
            checkpoint={selectedCheckpoint} 
            files={selectedRowFiles} 
            handleViewFile={handleViewFile} 
            handleDownloadFile={handleDownloadFile} 
            handleDeleteFile={handleDeleteFile}
          />
        </>
      )}

      {/* FILE PREVIEW DIALOG */}
      <FilePreviewDialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          // Clean up object URL
          if (previewFileUrl) {
            URL.revokeObjectURL(previewFileUrl);
          }
        }}
        file={previewFile}
        fileUrl={previewFileUrl}
      />

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckpointMaster;