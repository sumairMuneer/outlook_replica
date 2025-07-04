import React, { useState } from 'react';
import '../styles/MailList.css';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import FlagIcon from '@mui/icons-material/Flag';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

const MailList = ({ conversations, selectedMail, onMailSelect, onToggleFlag, onTogglePin, onDeleteMail, onToggleRead, selectedMailIds, onSelectMail, onSelectAll, handleDragStart, onEditScheduled, onCancelScheduled }) => {
    const allSelected = conversations.length > 0 && selectedMailIds.length === conversations.reduce((total, conv) => total + conv.mails.length, 0);
    const [hoveredMailId, setHoveredMailId] = useState(null);

    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAllMailIds = () => {
        return conversations.reduce((ids, conv) => [...ids, ...conv.mails.map(m => m.id)], []);
    };

    const handleSelectAll = (checked) => {
        onSelectAll(checked, getAllMailIds());
    };

    const getCountdown = (scheduledAt) => {
        if (!scheduledAt) return '';
        const now = new Date();
        const target = new Date(scheduledAt);
        const diff = target - now;

        if (diff <= 0) return 'Sending soon...';

        // Show scheduled date and time in local format
        const scheduledDate = new Date(scheduledAt);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format based on when it's scheduled
        if (scheduledDate.toDateString() === today.toDateString()) {
            // Today - show time only
            return `Today at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (scheduledDate.toDateString() === tomorrow.toDateString()) {
            // Tomorrow - show "Tomorrow at time"
            return `Tomorrow at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            // Other days - show date and time
            return scheduledDate.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const renderMailItem = (mail) => {
        const isScheduled = mail.scheduledAt && new Date(mail.scheduledAt) > new Date();
        return (
            <li
                key={mail.id}
                className={
                    'mail-list-row' +
                    (selectedMail && selectedMail.id === mail.id ? ' selected' : '') +
                    (!mail.read ? ' unread' : '') +
                    (isScheduled ? ' scheduled' : '')
                }
                onClick={e => {
                    if (e.target.closest('.mail-checkbox') || e.target.closest('.mail-flag') || e.target.closest('.mail-pin') || e.target.closest('.mail-delete') || e.target.closest('.mail-envelope') || e.target.closest('.mail-edit') || e.target.closest('.mail-cancel')) return;
                    onMailSelect(mail);
                }}
                onMouseEnter={() => setHoveredMailId(mail.id)}
                onMouseLeave={() => setHoveredMailId(null)}
                draggable
                onDragStart={() => handleDragStart(mail.id)}
            >
                <div className="mail-list-row-flex">
                    <div className="mail-avatar-container">
                        {hoveredMailId === mail.id || selectedMailIds.includes(mail.id) ? (
                            <Checkbox
                                className="mail-checkbox"
                                checked={selectedMailIds.includes(mail.id)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onSelectMail(mail.id);
                                }}
                                size="small"
                                onClick={e => e.stopPropagation()}
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.2rem'
                                    }
                                }}
                            />
                        ) : (
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                        bgcolor: isScheduled ? '#ff9800' : '#0078d4',
                                        color: '#fff',
                                        border: isScheduled ? '2px solid #ff9800' : undefined
                                }}
                            >
                                {getInitials(mail.sender)}
                            </Avatar>
                        )}
                        {isScheduled && (
                            <span style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                background: '#ff9800',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                borderRadius: 8,
                                padding: '2px 6px',
                                zIndex: 2
                            }}>Scheduled</span>
                        )}
                    </div>
                    <div className="mail-content-container">
                        <div className="mail-list-row-first">
                            <span
                                className="mail-sender"
                                style={{
                                    fontWeight: 700,
                                    minWidth: 0,
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    marginLeft: 8
                                }}
                                title={mail.sender}
                            >
                                {mail.sender}
                            </span>
                            <div className="mail-list-row-actions">
                                <Tooltip title={mail.read ? 'Mark as unread' : 'Mark as read'}>
                                    <IconButton
                                        className="mail-envelope"
                                        onClick={e => { e.stopPropagation(); onToggleRead && onToggleRead(mail); }}
                                        size="small"
                                    >
                                        {mail.read ? <MailIcon fontSize="small" sx={{ color: '#0078d4' }} /> : <MarkEmailUnreadIcon fontSize="small" sx={{ color: '#0078d4' }} />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={mail.flagged ? 'Unflag' : 'Flag'}>
                                    <IconButton
                                        className="mail-flag"
                                        onClick={e => { e.stopPropagation(); onToggleFlag(mail.id); }}
                                        size="small"
                                        color={mail.flagged ? 'error' : 'default'}
                                    >
                                        {mail.flagged ? <FlagIcon fontSize="small" /> : <OutlinedFlagIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={mail.pinned ? 'Unpin' : 'Pin'}>
                                    <IconButton
                                        className="mail-pin"
                                        onClick={e => { e.stopPropagation(); onTogglePin(mail.id); }}
                                        size="small"
                                        color={mail.pinned ? 'primary' : 'default'}
                                    >
                                        {mail.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="mail-list-row-second">
                            <span
                                className="mail-subject"
                                style={{
                                    fontWeight: mail.read ? 500 : 700,
                                    minWidth: 0,
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                }}
                                title={mail.subject}
                            >
                                {mail.subject}
                            </span>
                            <span className="mail-date" style={{ margin: '0 12px', minWidth: 70, textAlign: 'right', color: '#222', fontWeight: 500 }}>
                                {mail.scheduledAt
                                    ? new Date(mail.scheduledAt).toLocaleString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : mail.date}
                            </span>
                            <Tooltip title="Delete">
                                <IconButton
                                    className="mail-delete"
                                    onClick={e => { e.stopPropagation(); onDeleteMail(mail.id); }}
                                    size="small"
                                    color="default"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {isScheduled && (
                                <>
                                    <Tooltip title="Edit Scheduled Email">
                                        <IconButton
                                            className="mail-edit"
                                            onClick={e => { e.stopPropagation(); onEditScheduled && onEditScheduled(mail); }}
                                            size="small"
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel Scheduled Email">
                                        <IconButton
                                            className="mail-cancel"
                                            onClick={e => { e.stopPropagation(); onCancelScheduled ? onCancelScheduled(mail) : onDeleteMail(mail.id); }}
                                            size="small"
                                            color="error"
                                        >
                                            <CancelIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                        <div className="mail-list-row-third">
                            <span className="mail-preview">{mail.body.slice(0, 80)}{mail.body.length > 80 ? '...' : ''}</span>
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="mail-list">
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #e1e4ea', gap: 4 }}>
                <Checkbox
                    checked={allSelected}
                    indeterminate={selectedMailIds.length > 0 && !allSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    size="small"
                />
                <h4 style={{ margin: 0, flex: 1 }}>Mail</h4>
            </div>
            <ul>
                {conversations && conversations.length > 0 ? conversations.map((conversation) =>
                    conversation.mails.map(mail => renderMailItem(mail))
                ) : <li className="empty">No mail in this folder.</li>}
            </ul>
        </div>
    );
};

export default MailList; 