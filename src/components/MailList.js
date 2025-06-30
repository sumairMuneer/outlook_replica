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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

const MailList = ({ conversations, selectedMail, onMailSelect, onToggleFlag, onTogglePin, onDeleteMail, onToggleRead, selectedMailIds, onSelectMail, onSelectAll, handleDragStart, toggleConversation, groupByConversation, formatDate, onEditScheduled, onCancelScheduled }) => {
    const allSelected = conversations.length > 0 && selectedMailIds.length === conversations.reduce((total, conv) => total + conv.mails.length, 0);
    const [hoveredMailId, setHoveredMailId] = useState(null);
    const [hoveredConversationId, setHoveredConversationId] = useState(null);

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
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return `Sends in ${hours}h ${minutes}m ${seconds}s`;
    };

    const renderConversationHeader = (conversation) => {
        const { conversationId, latestMail, unreadCount, isExpanded, mails, date } = conversation;
        const hasMultipleMails = mails.length > 1;
        const hasUnreadMails = unreadCount > 0;
        const isDateGroup = !groupByConversation;

        if (isDateGroup) {
            // For date grouping, show a simple date header
            return (
                <div
                    className={`date-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleConversation(conversationId)}
                    data-date-group={true}
                >
                    <div className="date-header-content">
                        <span className="date-label">{formatDate(date)}</span>
                        <span className="date-count">({mails.length})</span>
                        <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleConversation(conversationId);
                                }}
                            >
                                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            );
        }

        // Original conversation header logic
        return (
            <div
                className={`conversation-header ${isExpanded ? 'expanded' : ''} ${hasUnreadMails ? 'unread' : ''}`}
                onClick={() => toggleConversation(conversationId)}
                data-date-group={false}
            >
                <div className="mail-list-row-flex">
                    <div className="mail-avatar-container">
                        {hoveredConversationId === conversationId ? (
                            <Checkbox
                                className="mail-checkbox"
                                checked={mails.every(m => selectedMailIds.includes(m.id))}
                                indeterminate={mails.some(m => selectedMailIds.includes(m.id)) && !mails.every(m => selectedMailIds.includes(m.id))}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    const mailIds = mails.map(m => m.id);
                                    if (e.target.checked) {
                                        mailIds.forEach(id => {
                                            if (!selectedMailIds.includes(id)) {
                                                onSelectMail(id);
                                            }
                                        });
                                    } else {
                                        mailIds.forEach(id => {
                                            if (selectedMailIds.includes(id)) {
                                                onSelectMail(id);
                                            }
                                        });
                                    }
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
                                    bgcolor: '#0078d4',
                                    color: '#fff'
                                }}
                            >
                                {getInitials(latestMail.sender)}
                            </Avatar>
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
                                title={latestMail.sender}
                            >
                                {latestMail.sender}
                                {hasMultipleMails && (
                                    <span style={{ color: '#666', fontWeight: 500, marginLeft: 8 }}>
                                        ({mails.length})
                                    </span>
                                )}
                            </span>
                            <div className="mail-list-row-actions">
                                {hasMultipleMails && (
                                    <Tooltip title={isExpanded ? 'Collapse conversation' : 'Expand conversation'}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleConversation(conversationId);
                                            }}
                                        >
                                            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title={latestMail.read ? 'Mark as unread' : 'Mark as read'}>
                                    <IconButton
                                        className="mail-envelope"
                                        onClick={e => { e.stopPropagation(); onToggleRead && onToggleRead(latestMail); }}
                                        size="small"
                                    >
                                        {latestMail.read ? <MailIcon fontSize="small" sx={{ color: '#0078d4' }} /> : <MarkEmailUnreadIcon fontSize="small" sx={{ color: '#0078d4' }} />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={latestMail.flagged ? 'Unflag' : 'Flag'}>
                                    <IconButton
                                        className="mail-flag"
                                        onClick={e => { e.stopPropagation(); onToggleFlag(latestMail.id); }}
                                        size="small"
                                        color={latestMail.flagged ? 'error' : 'default'}
                                    >
                                        {latestMail.flagged ? <FlagIcon fontSize="small" /> : <OutlinedFlagIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={latestMail.pinned ? 'Unpin' : 'Pin'}>
                                    <IconButton
                                        className="mail-pin"
                                        onClick={e => { e.stopPropagation(); onTogglePin(latestMail.id); }}
                                        size="small"
                                        color={latestMail.pinned ? 'primary' : 'default'}
                                    >
                                        {latestMail.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="mail-list-row-second">
                            <span
                                className="mail-subject"
                                style={{
                                    fontWeight: hasUnreadMails ? 700 : 500,
                                    minWidth: 0,
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                }}
                                title={latestMail.subject}
                            >
                                {latestMail.subject}
                                {unreadCount > 0 && (
                                    <span style={{ color: '#0078d4', fontWeight: 600, marginLeft: 8 }}>
                                        ({unreadCount})
                                    </span>
                                )}
                            </span>
                            <span className="mail-date" style={{ margin: '0 12px', minWidth: 70, textAlign: 'right', color: '#222', fontWeight: 500 }}>
                                {latestMail.date}
                            </span>
                            <Tooltip title="Delete">
                                <IconButton
                                    className="mail-delete"
                                    onClick={e => { e.stopPropagation(); onDeleteMail(latestMail.id); }}
                                    size="small"
                                    color="default"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div className="mail-list-row-third">
                            <span className="mail-preview">
                                {latestMail.body.slice(0, 80)}{latestMail.body.length > 80 ? '...' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMailItem = (mail, conversationId, isInExpandedConversation) => {
        const isScheduled = mail.scheduledAt && new Date(mail.scheduledAt) > new Date();
        return (
            <li
                key={mail.id}
                className={
                    'mail-list-row conversation-mail' +
                    (selectedMail && selectedMail.id === mail.id ? ' selected' : '') +
                    (!mail.read ? ' unread' : '') +
                    (isInExpandedConversation ? ' expanded-conversation' : '')
                }
                onClick={e => {
                    if (e.target.closest('.mail-checkbox') || e.target.closest('.mail-flag') || e.target.closest('.mail-pin') || e.target.closest('.mail-delete') || e.target.closest('.mail-envelope') || e.target.closest('.mail-edit') || e.target.closest('.mail-cancel')) return;
                    onMailSelect(mail);
                }}
                onMouseEnter={() => setHoveredMailId(mail.id)}
                onMouseLeave={() => setHoveredMailId(null)}
                draggable
                onDragStart={() => handleDragStart(mail.id)}
                data-date-group={!groupByConversation}
            >
                <div className="mail-list-row-flex">
                    <div className="mail-avatar-container">
                        {hoveredMailId === mail.id ? (
                            <Checkbox
                                className="mail-checkbox"
                                checked={selectedMailIds.includes(mail.id)}
                                onChange={() => onSelectMail(mail.id)}
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
                                    bgcolor: '#0078d4',
                                    color: '#fff'
                                }}
                            >
                                {getInitials(mail.sender)}
                            </Avatar>
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
                            <span className="mail-date" style={{ margin: '0 12px', minWidth: 70, textAlign: 'right', color: '#222', fontWeight: 500 }}>{mail.date}</span>
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
                                <span style={{ color: '#0078d4', fontWeight: 500, marginLeft: 8 }}>
                                    {getCountdown(mail.scheduledAt)}
                                </span>
                            )}
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
                                            onClick={e => { e.stopPropagation(); onCancelScheduled && onCancelScheduled(mail); }}
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
                {conversations && conversations.length > 0 ? conversations.map(conversation => (
                    <div key={conversation.conversationId} className="conversation-container">
                        <div
                            className="conversation-header-wrapper"
                            onMouseEnter={() => setHoveredConversationId(conversation.conversationId)}
                            onMouseLeave={() => setHoveredConversationId(null)}
                        >
                            {renderConversationHeader(conversation)}
                        </div>
                        {groupByConversation ? (
                            // Conversation grouping: show only additional emails when expanded
                            conversation.isExpanded && conversation.mails.length > 1 && (
                                <div className="conversation-mails" data-date-group={false}>
                                    {conversation.mails.slice(1).map(mail =>
                                        renderMailItem(mail, conversation.conversationId, true)
                                    )}
                                </div>
                            )
                        ) : (
                            // Date grouping: show all emails under the date header when expanded
                            conversation.isExpanded && (
                                <div className="date-mails" data-date-group={true}>
                                    {conversation.mails.map(mail =>
                                        renderMailItem(mail, conversation.conversationId, false)
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )) : <li className="empty">No mail in this folder.</li>}
            </ul>
        </div>
    );
};

export default MailList; 