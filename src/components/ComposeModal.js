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
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import useStore from '../store';
import axios from 'axios';

const ComposeModal = ({ open, onClose, onSend, replyTo, to: toProp, cc: ccProp, subject: subjectProp, body: bodyProp, attachments: attachmentsProp, scheduledAt: scheduledAtProp }) => {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [scheduledAt, setScheduledAt] = useState(null);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const saveDraft = useStore(state => state.saveDraft);
    const sendMail = useStore(state => state.sendMail);

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

    const handleSend = async () => {
        if (!to || !subject || !body) return;

        setLoading(true);
        setError(null);

        try {
            const emailData = { to, cc, subject, body, attachments, scheduledAt };

            // Use the store's sendMail function which calls the backend API
            await sendMail(emailData);

            // Clear form
            setTo('');
            setCc('');
            setSubject('');
            setBody('');
            setAttachments([]);
            setScheduledAt(null);

            // Close modal
            if (onClose) onClose();

        } catch (error) {
            console.error('Error sending email:', error);
            setError(error.response?.data?.error || error.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
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

    const handleSaveDraft = async () => {
        setLoading(true);
        setError(null);

        try {
            await saveDraft({ to, cc, subject, body, attachments, scheduledAt });

            // Clear form
            setTo('');
            setCc('');
            setSubject('');
            setBody('');
            setAttachments([]);
            setScheduledAt(null);

            // Close modal
            if (onClose) onClose();
        } catch (error) {
            console.error('Error saving draft:', error);
            setError(error.response?.data?.error || error.message || 'Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{replyTo ? 'Reply' : 'Compose Mail'}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="To"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                />
                <TextField
                    label="CC"
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                />
                <TextField
                    label="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                />
                <TextField
                    label="Body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    minRows={6}
                    disabled={loading}
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
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                    onDrop={loading ? undefined : handleDrop}
                    onDragOver={loading ? undefined : handleDragOver}
                    onDragLeave={loading ? undefined : handleDragLeave}
                    onDragEnd={loading ? undefined : handleDragLeave}
                >
                    <input
                        accept="*"
                        style={{ display: 'none' }}
                        id="attachment-input"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                    <label htmlFor="attachment-input">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<AttachFileIcon />}
                            disabled={loading}
                        >
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
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveAttachment(idx)}
                                            disabled={loading}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSaveDraft}
                    variant="outlined"
                    color="secondary"
                    disabled={loading || (!to && !subject && !body)}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                    onClick={handleScheduleSend}
                    variant="outlined"
                    color="primary"
                    startIcon={<ScheduleIcon />}
                    disabled={loading || !to || !subject || !body}
                >
                    Schedule Send
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    color="primary"
                    disabled={loading || !to || !subject || !body}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Sending...' : 'Send'}
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
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" disabled={loading} />}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleScheduleDialogClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleScheduleConfirm}
                        variant="contained"
                        color="primary"
                        disabled={!scheduledAt || loading}
                    >
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