import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

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
      <DialogTitle>
        View Checkpoint Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {checkpoint.name || 'N/A'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Todos
              </Typography>
              <Box sx={{ mb: 2 }}>
                {checkpoint.todos && checkpoint.todos.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {checkpoint.todos.map((todo, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {index + 1}. {todo}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No todos
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {formatDate(checkpoint.date)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Uploaded Files
              </Typography>
              
              {checkpoint.files && checkpoint.files.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List>
                    {checkpoint.files.map((file, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary={file.originalname || file.filename}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {formatFileSize(file.size)}
                                </Typography>
                                {file.uploadDate && ` • ${formatDate(file.uploadDate)}`}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleViewFile(file)}
                              title="View File"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDownloadFile(file)}
                              title="Download File"
                              size="small"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < checkpoint.files.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No files uploaded
                </Typography>
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

export default ViewCheckpointDialog;