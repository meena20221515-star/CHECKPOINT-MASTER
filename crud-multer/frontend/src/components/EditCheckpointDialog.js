editdialog
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Typography,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

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

  useEffect(() => {
    if (!open) {
      setNewFiles([]);
    }
  }, [open]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setNewFiles(files);
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
      <DialogTitle>
        Edit Checkpoint
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Left Column - Inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name *"
                placeholder="Name *"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                label="Todo *"
                placeholder="Todo *"
                name="todoInput"
                value={formData.todoInput}
                onChange={handleTodoInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTodo();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleAddTodo}
                        color="success"
                        sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                        disabled={isSubmitting}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
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
                    {newFiles.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{newFiles.length - 3} more
                      </Typography>
                    )}
                    
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

            {/* Right Column - Preview */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
                Todo Preview
              </Typography>
              
              {todos.length > 0 ? (
                <Card variant="outlined">
                  <CardContent sx={{ py: 1, maxHeight: 150, overflow: 'auto' }}>
                    <List dense>
                      {todos.map((todo, index) => (
                        <ListItem
                          key={index}
                          divider={index < todos.length - 1}
                          sx={{ py: 0.5 }}
                        >
                          {editingTodoIndex === index ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={editingTodoText}
                                onChange={(e) => setEditingTodoText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEditTodo(index);
                                  }
                                  if (e.key === 'Escape') {
                                    handleCancelEditTodo();
                                  }
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
                              <ListItemText 
                                primary={todo} 
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                              />
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
                  <Typography variant="body2" color="text.secondary">
                    Click + icon to add todos to preview
                  </Typography>
                </Box>
              )}

              {/* Files Preview */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>
                Files Preview
              </Typography>
              {uploadedFiles.length > 0 ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {uploadedFiles.length} file(s) uploaded
                    </Typography>
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
                      {uploadedFiles.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{uploadedFiles.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No files uploaded
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'UPDATING...' : 'Update Checkpoint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCheckpointDialog;