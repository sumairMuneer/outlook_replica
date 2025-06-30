import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DialogContentText from '@mui/material/DialogContentText';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const ComposeModal = ({ open, onClose, onSend, replyTo, to: toProp, cc: ccProp, subject: subjectProp, body: bodyProp, attachments: attachmentsProp, scheduledAt: scheduledAtProp }) => {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [scheduledAt, setScheduledAt] = useState(null);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

    // Determine mode: edit, reply, or new
    const mode = replyTo ? 'reply' : (toProp || ccProp || subjectProp || bodyProp || attachmentsProp || scheduledAtProp) ? 'edit' : 'new';

    useEffect(() => {
        if (!open) return;
        if (mode === 'reply') {
            setTo(replyTo.sender);
            setSubject(`Re: ${replyTo.subject}`);
            setBody(`\n\n--- Original message ---\n${replyTo.body}`);
            setCc('');
            setScheduledAt(null);
            setAttachments([]);
        } else if (mode === 'edit') {
            setTo(toProp || '');
            setCc(ccProp || '');
            setSubject(subjectProp || '');
            setBody(bodyProp || '');
            setAttachments(attachmentsProp || []);
            setScheduledAt(scheduledAtProp || null);
        } else {
            setTo('');
            setSubject('');
            setBody('');
            setCc('');
            setScheduledAt(null);
            setAttachments([]);
        }
        // Only run when modal is opened
        // eslint-disable-next-line
    }, [open]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const handleRemoveAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer && e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files);
            setAttachments(prev => [...prev, ...files]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleSend = () => {
        if (!to || !subject || !body) return;
        onSend({ to, cc, subject, body, attachments, scheduledAt });
        setTo('');
        setCc('');
        setSubject('');
        setBody('');
        setAttachments([]);
        setScheduledAt(null);
    };

    const handleScheduleSend = () => {
        setScheduleDialogOpen(true);
    };

    const handleScheduleDialogClose = () => {
        setScheduleDialogOpen(false);
    };

    const handleScheduleConfirm = () => {
        setScheduleDialogOpen(false);
        handleSend();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{replyTo ? 'Reply' : 'Compose Mail'}</DialogTitle>
            <DialogContent>
                <TextField
                    label="To"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="CC"
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={6}
                />
                <div
                    style={{
                        marginTop: 16,
                        border: '2px dashed #0078d4',
                        borderRadius: 6,
                        padding: 16,
                        background: dragActive ? '#e3f2fd' : '#fafbfc',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragLeave}
                >
                    <input
                        accept="*"
                        style={{ display: 'none' }}
                        id="attachment-input"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="attachment-input">
                        <Button variant="outlined" component="span" startIcon={<AttachFileIcon />}>
                            Add Attachments
                        </Button>
                    </label>
                    <div style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
                        or drag and drop files here
                    </div>
                    {attachments.length > 0 && (
                        <ul style={{ marginTop: 16, textAlign: 'left' }}>
                            {attachments.map((file, idx) => {
                                const isImage = file.type.startsWith('image/');
                                return (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        {isImage ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                                            />
                                        ) : (
                                            <ImageIcon style={{ color: '#bbb', fontSize: 32 }} />
                                        )}
                                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                        <Button size="small" color="error" onClick={() => handleRemoveAttachment(idx)}>Remove</Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleScheduleSend}
                    variant="outlined"
                    color="primary"
                    startIcon={<ScheduleIcon />}
                    disabled={!to || !subject || !body}
                >
                    Schedule Send
                </Button>
                <Button onClick={handleSend} variant="contained" color="primary" disabled={!to || !subject || !body}>
                    Send
                </Button>
            </DialogActions>
            <Dialog open={scheduleDialogOpen} onClose={handleScheduleDialogClose}>
                <DialogTitle>Schedule Send</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Choose the date and time to send this email.
                    </DialogContentText>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Scheduled Date & Time"
                            value={scheduledAt}
                            onChange={setScheduledAt}
                            minDateTime={new Date()}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleScheduleDialogClose}>Cancel</Button>
                    <Button onClick={handleScheduleConfirm} variant="contained" color="primary" disabled={!scheduledAt}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            {scheduledAt && (
                <div style={{ margin: '8px 0 0 0', color: '#0078d4', fontSize: 14 }}>
                    Scheduled to send at: {new Date(scheduledAt).toLocaleString()}
                </div>
            )}
        </Dialog>
    );
};

export default ComposeModal; 