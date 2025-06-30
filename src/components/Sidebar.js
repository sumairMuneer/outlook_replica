import React from 'react';
import '../styles/Sidebar.css';
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportIcon from '@mui/icons-material/Report';
import ArchiveIcon from '@mui/icons-material/Archive';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const folders = [
    { name: 'Inbox', icon: <InboxIcon /> },
    { name: 'Sent', icon: <SendIcon /> },
    { name: 'Drafts', icon: <DraftsIcon /> },
    { name: 'Deleted', icon: <DeleteIcon /> },
    { name: 'Junk', icon: <ReportIcon /> },
    { name: 'Archive', icon: <ArchiveIcon /> },
    { name: 'Scheduled', icon: <ScheduleIcon /> },
];

const Sidebar = ({ selectedFolder, onSelectFolder, onDropOnFolder }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <div className={isSmall ? 'sidebar sidebar-collapsed' : 'sidebar'}>
            <h2 style={{ display: isSmall ? 'none' : 'block' }}>Outlook</h2>
            <nav>
                <ul>
                    {folders.map(folder => (
                        <Tooltip key={folder.name} title={folder.name} placement="right" disableHoverListener={!isSmall}>
                            <li
                                className={selectedFolder === folder.name ? 'active' : ''}
                                onClick={() => onSelectFolder(folder.name)}
                                onDrop={e => {
                                    e.preventDefault();
                                    if (onDropOnFolder) onDropOnFolder(folder.name);
                                }}
                                onDragOver={e => e.preventDefault()}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: isSmall ? 'center' : 'flex-start', gap: 12 }}
                            >
                                {folder.icon}
                                {!isSmall && <span>{folder.name}</span>}
                            </li>
                        </Tooltip>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar; 