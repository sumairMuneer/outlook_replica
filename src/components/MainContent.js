import React, { useState } from 'react';
import MailList from './MailList';
import ReadingPane from './ReadingPane';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import '../styles/MainContent.css';

const knownSenders = ['Microsoft', 'HR Department', 'Team Lead', 'Finance Department', 'Management', 'Sales Manager'];

const MainContent = ({ mails, selectedMail, onMailSelect, onReply, onDelete, onMoveTo, onToggleRead, onToggleStar, onSelectMail, onSelectAll, selectedMailIds, selectedFolder, onBulkStar, onToggleFlag, onBulkFlag, onTogglePin, onBulkPin, onDeleteMail, onBulkRead, conversations, toggleConversation, groupByConversation, toggleGrouping, onEditScheduled, onCancelScheduled }) => {
    const [focusedTab, setFocusedTab] = useState('Focused');

    let displayConversations = conversations;
    let showTabs = false;
    if (selectedFolder === 'Inbox') {
        showTabs = true;
        const focusedConversations = conversations.filter(conv =>
            conv.latestMail.starred || knownSenders.includes(conv.latestMail.sender)
        );
        const otherConversations = conversations.filter(conv =>
            !conv.latestMail.starred && !knownSenders.includes(conv.latestMail.sender)
        );
        displayConversations = focusedTab === 'Focused' ? focusedConversations : otherConversations;
    }

    const handleDragStart = (mailId) => {
        if (onSelectMail) onSelectMail(mailId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // If it's already a date range (Today, Yesterday, etc.) or a month (March 2025), return as is
        if ([
            'Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'
        ].includes(dateString)) {
            return dateString;
        }
        // Check if it's a month format (e.g., "March 2025")
        if (dateString.match(/^[A-Za-z]+ \d{4}$/)) {
            return dateString;
        }
        // For individual dates, format them
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    return (
        <div className="main-content-row">
            <Box sx={{ width: 380, background: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #e1e4ea', minHeight: 44 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {showTabs && (
                            <Tabs
                                value={focusedTab}
                                onChange={(_, v) => setFocusedTab(v)}
                                indicatorColor="primary"
                                textColor="primary"
                                sx={{ minHeight: 44 }}
                            >
                                <Tab label="Focused" value="Focused" sx={{ minHeight: 44, fontWeight: 600, fontSize: 15 }} />
                                <Tab label="Other" value="Other" sx={{ minHeight: 44, fontWeight: 600, fontSize: 15 }} />
                            </Tabs>
                        )}
                    </div>
                    <Tooltip title={groupByConversation ? 'Group by Date' : 'Group by Conversation'}>
                        <IconButton
                            onClick={toggleGrouping}
                            size="small"
                            sx={{ color: '#0078d4' }}
                        >
                            {groupByConversation ? <ViewModuleIcon /> : <ViewListIcon />}
                        </IconButton>
                    </Tooltip>
                </div>
                <MailList
                    conversations={displayConversations}
                    selectedMail={selectedMail}
                    onMailSelect={onMailSelect}
                    onToggleStar={onToggleStar}
                    onBulkStar={onBulkStar}
                    onToggleFlag={onToggleFlag}
                    onBulkFlag={onBulkFlag}
                    onTogglePin={onTogglePin}
                    onBulkPin={onBulkPin}
                    onDeleteMail={onDeleteMail}
                    onBulkRead={onBulkRead}
                    onToggleRead={onToggleRead}
                    selectedMailIds={selectedMailIds}
                    onSelectMail={onSelectMail}
                    onSelectAll={onSelectAll}
                    handleDragStart={handleDragStart}
                    toggleConversation={toggleConversation}
                    groupByConversation={groupByConversation}
                    formatDate={formatDate}
                    onEditScheduled={typeof onEditScheduled === 'function' ? onEditScheduled : undefined}
                    onCancelScheduled={typeof onCancelScheduled === 'function' ? onCancelScheduled : undefined}
                />
            </Box>
            <ReadingPane
                mail={selectedMail}
                onReply={onReply}
                onDelete={onDelete}
                onMoveTo={onMoveTo}
                onToggleRead={onToggleRead}
                selectedFolder={selectedFolder}
            />
        </div>
    );
};

export default MainContent; 