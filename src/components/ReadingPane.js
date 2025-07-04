import React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FlagIcon from '@mui/icons-material/Flag';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import '../styles/ReadingPane.css';

const folderOptions = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive'];

function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const ReadingPane = ({ mail, onReply, onDelete, onMoveTo, onToggleRead, selectedFolder }) => {
    if (!mail) {
        return (
            <div className="reading-pane">
                <div className="placeholder">Select an email to read</div>
            </div>
        );
    }

    const handleMoveTo = (targetFolder) => {
        if (targetFolder && targetFolder !== selectedFolder) {
            onMoveTo(targetFolder);
        }
    };

    return (
        <div className="reading-pane outlook-pane">
            {/* Header: Avatar, Subject, Star, Pin, Flag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
                <Avatar sx={{ width: 48, height: 48, fontWeight: 600, fontSize: 22, bgcolor: '#0078d4' }}>{getInitials(mail.sender)}</Avatar>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 600, color: '#222' }}>{mail.subject}</span>
                        {mail.starred ? <StarIcon sx={{ color: '#f7c325' }} fontSize="small" /> : <StarBorderIcon sx={{ color: '#bbb' }} fontSize="small" />}
                        {mail.pinned ? <PushPinIcon sx={{ color: '#0078d4' }} fontSize="small" /> : null}
                        {mail.flagged ? <FlagIcon sx={{ color: '#e45735' }} fontSize="small" /> : null}
                    </div>
                    <div style={{ fontSize: 15, color: '#555', marginTop: 2 }}>
                        <span style={{ fontWeight: 500 }}>{mail.sender}</span>
                        {mail.to && <span style={{ marginLeft: 8 }}>to <b>{mail.to}</b></span>}
                        {mail.cc && <span style={{ marginLeft: 8 }}>cc <b>{mail.cc}</b></span>}
                        <span style={{ marginLeft: 8 }}>{mail.date}</span>
                    </div>
                </div>
            </div>
            <Divider sx={{ my: 1 }} />
            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Button variant="outlined" startIcon={<ReplyIcon />} onClick={onReply} sx={{ textTransform: 'none' }}>Reply</Button>
                <Button variant="outlined" startIcon={<ReplyAllIcon />} sx={{ textTransform: 'none' }}>Reply All</Button>
                <Button variant="outlined" startIcon={<ForwardToInboxIcon />} sx={{ textTransform: 'none' }}>Forward</Button>
                <Tooltip title="Delete"><IconButton color="error" onClick={onDelete}><DeleteIcon /></IconButton></Tooltip>
                <Select
                    size="small"
                    value=""
                    onChange={e => handleMoveTo(e.target.value)}
                    style={{ minWidth: 120 }}
                    displayEmpty
                    disabled={!mail}
                >
                    <MenuItem value="" disabled>
                        <em>Move to...</em>
                    </MenuItem>
                    {folderOptions.filter(f => f !== selectedFolder).map(folder => (
                        <MenuItem key={folder} value={folder}>{folder}</MenuItem>
                    ))}
                </Select>
                <Button
                    variant="outlined"
                    startIcon={mail.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
                    onClick={onToggleRead}
                    sx={{ textTransform: 'none' }}
                >
                    Mark as {mail.read ? 'Unread' : 'Read'}
                </Button>
                <IconButton><MoreVertIcon /></IconButton>
            </div>
            {/* Attachments as chips/thumbnails */}
            {mail.attachments && mail.attachments.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    {mail.attachments.map((file, idx) => {
                        const isImage = file.type && file.type.startsWith('image/');
                        const url = file instanceof File ? URL.createObjectURL(file) : '#';
                        return isImage ? (
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
                                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }}
                                />
                            </a>
                        ) : (
                            <Chip
                                key={idx}
                                label={file.name}
                                component="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                variant="outlined"
                                sx={{ fontSize: 14 }}
                            />
                        );
                    })}
                </Stack>
            )}
            {/* Message Body */}
            <div className="mail-body" style={{ fontSize: 16, color: '#222', lineHeight: 1.7, marginBottom: 24 }}>{mail.body}</div>
            {/* Subtle meta info */}
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
                Status: {mail.read ? 'Read' : 'Unread'}
                {mail.folder && <span style={{ marginLeft: 12 }}>Folder: {mail.folder}</span>}
            </div>
        </div>
    );
};

export default ReadingPane; 