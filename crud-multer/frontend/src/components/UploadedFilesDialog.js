import React from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

const FilesDialog = ({ 
  open, 
  onClose, 
  checkpoint, 
  files, 
  handleViewFile, 
  handleDownloadFile 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
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

export default FilesDialog;