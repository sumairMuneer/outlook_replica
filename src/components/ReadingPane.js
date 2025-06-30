import React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import '../styles/ReadingPane.css';

const folderOptions = ['Inbox', 'Sent', 'Drafts'];

const ReadingPane = ({ mail, onReply, onDelete, onMoveTo, onToggleRead, selectedFolder }) => {
    if (!mail) {
        return (
            <div className="reading-pane">
                <div className="placeholder">Select an email to read</div>
            </div>
        );
    }
    return (
        <div className="reading-pane">
            <h2>{mail.subject}</h2>
            <div className="mail-meta">
                <span className="mail-sender">From: {mail.sender}</span>
                {mail.cc && (
                    <span className="mail-cc">CC: {mail.cc}</span>
                )}
                <span className="mail-date">{mail.date}</span>
            </div>
            <div className="mail-body">{mail.body}</div>
            {mail.attachments && mail.attachments.length > 0 && (
                <div className="mail-attachments" style={{ marginTop: 16 }}>
                    <strong>Attachments:</strong>
                    <ul style={{ marginTop: 8 }}>
                        {mail.attachments.map((file, idx) => (
                            <li key={idx}>
                                <a
                                    href={file instanceof File ? URL.createObjectURL(file) : '#'}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {file.name} {file.size ? `(${(file.size / 1024).toFixed(1)} KB)` : ''}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                        {mail.attachments.map((file, idx) => {
                            const isImage = file.type && file.type.startsWith('image/');
                            if (!isImage) return null;
                            const url = file instanceof File ? URL.createObjectURL(file) : '#';
                            return (
                                <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-block', border: '1px solid #ddd', borderRadius: 4, padding: 2 }}
                                >
                                    <img
                                        src={url}
                                        alt={file.name}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
            <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Button variant="outlined" startIcon={<ReplyIcon />} onClick={onReply}>
                    Reply
                </Button>
                <IconButton color="error" onClick={onDelete} aria-label="delete">
                    <DeleteIcon />
                </IconButton>
                <Select
                    size="small"
                    value={selectedFolder}
                    onChange={e => onMoveTo(e.target.value)}
                    style={{ minWidth: 120 }}
                >
                    {folderOptions.filter(f => f !== selectedFolder).map(folder => (
                        <MenuItem key={folder} value={folder}>{folder}</MenuItem>
                    ))}
                    <MenuItem value={selectedFolder} disabled>{selectedFolder}</MenuItem>
                </Select>
                <Button
                    variant="outlined"
                    startIcon={mail.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
                    onClick={onToggleRead}
                >
                    Mark as {mail.read ? 'Unread' : 'Read'}
                </Button>
            </div>
        </div>
    );
};

export default ReadingPane; 