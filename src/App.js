import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ComposeModal from './components/ComposeModal';
import RulesModal from './components/RulesModal';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import './styles/App.css';
import useStore from './store';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { ensureAllFolders } from './utils/mailFolders';

const folderNames = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];


function App() {
  const mailData = useStore(state => state.mailData);
  const setMailData = useStore(state => state.setMailData);
  const selectedMail = useStore(state => state.selectedMail);
  const setSelectedMail = useStore(state => state.setSelectedMail);
  const selectedFolder = useStore(state => state.selectedFolder);
  const setSelectedFolder = useStore(state => state.setSelectedFolder);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMailIds, setSelectedMailIds] = useState([]); // for multi-select
  const [darkMode, setDarkMode] = useState(false);
  const [rules, setRules] = useState([]); // rules array
  const [rulesOpen, setRulesOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // Sort by date: 'newest' or 'oldest'
  const [editScheduledMail, setEditScheduledMail] = useState(null);
  const [notifiedScheduledIds, setNotifiedScheduledIds] = useState([]);
  const fetchDrafts = useStore(state => state.fetchDrafts);
  const updateMail = useStore(state => state.updateMail);
  const fetchInbox = useStore(state => state.fetchInbox);
  const fetchSent = useStore(state => state.fetchSent);
  const fetchDeleted = useStore(state => state.fetchDeleted);
  const fetchJunk = useStore(state => state.fetchJunk);
  const fetchArchive = useStore(state => state.fetchArchive);
  const fetchScheduled = useStore(state => state.fetchScheduled);
  const sendMail = useStore(state => state.sendMail);
  const deleteMail = useStore(state => state.deleteMail);
  const bulkAction = useStore(state => state.bulkAction);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState(false);
  const [lastCanceledScheduled, setLastCanceledScheduled] = useState(null);
  const undoTimeoutRef = useRef(null);

  const allFolders = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0078d4', // Outlook blue
      },
      background: {
        default: darkMode ? '#1b1d1f' : '#f3f6fb',
        paper: darkMode ? '#23272f' : '#fff',
      },
      divider: darkMode ? '#2d2d2d' : '#e1e4ea',
    },
    shape: {
      borderRadius: 6, // Outlook is less rounded
    },
    typography: {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: 15,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 15,
            boxShadow: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${darkMode ? '#222' : '#e1e4ea'}`,
            background: darkMode ? '#23272f' : '#fff',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 56,
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [darkMode]);

  const handleToggleDarkMode = () => setDarkMode(dm => !dm);

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    // zustand will handle selectedMail, selectedMailIds, and fetchDrafts
  };

  const handleMailSelect = async (mail) => {
    if (selectedFolder === 'Drafts' && !mail.read) {
      await updateMail(mail._id, { read: true }, 'Drafts');
      await fetchDrafts();
      setSelectedMail({ ...mail, read: true });
    } else {
      setSelectedMail(mail);
    }
    setSelectedMailIds(() => []);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleComposeOpen = () => {
    setReplyTo(null);
    setComposeOpen(true);
  };

  const handleReply = () => {
    setReplyTo(selectedMail);
    setComposeOpen(true);
  };

  const handleComposeClose = () => {
    setComposeOpen(false);
    setReplyTo(null);
    setEditScheduledMail(null);
  };

  // Apply rules to a single mail, return {mail, folder}
  const applyRulesToMail = (mail, currentFolder) => {
    let updatedMail = { ...mail };
    let folder = currentFolder;
    for (const rule of rules) {
      if (
        (rule.conditionType === 'sender' && mail.sender.toLowerCase() === rule.conditionValue.toLowerCase()) ||
        (rule.conditionType === 'subject' && mail.subject.toLowerCase().includes(rule.conditionValue.toLowerCase()))
      ) {
        if (rule.actionType === 'move') {
          folder = rule.actionValue;
        } else if (rule.actionType === 'read') {
          updatedMail.read = true;
        } else if (rule.actionType === 'star') {
          updatedMail.starred = true;
        }
      }
    }
    return { mail: updatedMail, folder };
  };

  // Apply rules to all mails in all folders
  const applyRulesToAllMails = (allMailData) => {
    let newMailData = {};
    for (const folder of Object.keys(allMailData)) {
      for (const mail of allMailData[folder]) {
        const { mail: updatedMail, folder: newFolder } = applyRulesToMail(mail, folder);
        if (!newMailData[newFolder]) newMailData[newFolder] = [];
        newMailData[newFolder].push(updatedMail);
      }
    }
    // Ensure all folders exist
    for (const f of ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive']) {
      if (!newMailData[f]) newMailData[f] = [];
    }
    return newMailData;
  };

  // Re-apply rules whenever rules change
  useEffect(() => {
    // setMailData(prev => applyRulesToAllMails(prev));
    // eslint-disable-next-line
  }, [rules]);

  const handleSendMail = async (mail) => {
    try {
      if (mail.scheduledAt && new Date(mail.scheduledAt) > new Date()) {
        // Scheduled send: use backend API
        await sendMail(mail);
        setComposeOpen(false);
        setReplyTo(null);
        setEditScheduledMail(null);
        setSelectedFolder('Scheduled');
        return;
      }

      // Immediate send: use backend API
      await sendMail(mail);
      setComposeOpen(false);
      setReplyTo(null);
      setEditScheduledMail(null);
      setSelectedFolder('Sent');
    } catch (error) {
      // You could add error handling UI here
    }
  };

  const handleDelete = async () => {
    let idsToDelete = selectedMailIds.length > 0 ? selectedMailIds : (selectedMail ? [selectedMail.id] : []);

    if (idsToDelete.length === 0) return;

    try {
      if (idsToDelete.length === 1) {
        // Single delete
        await deleteMail(idsToDelete[0], selectedFolder);
      } else {
        // Bulk delete
        await bulkAction(idsToDelete, 'delete', null, selectedFolder);
      }

      // Clear selection after successful delete
      setSelectedMail(null);
      setSelectedMailIds(() => []);
    } catch (error) {
      // You could add error handling UI here
    }
  };

  const handleMoveTo = async (targetFolder) => {
    let idsToMove = selectedMailIds.length > 0 ? selectedMailIds : (selectedMail ? [selectedMail.id] : []);

    if (idsToMove.length === 0 || targetFolder === selectedFolder) return;

    try {
      // Use bulk action to move emails
      await bulkAction(idsToMove, 'move', targetFolder, selectedFolder);

      // Clear selection after successful move
      setSelectedMail(null);
      setSelectedMailIds(() => []);
    } catch (error) {
      // You could add error handling UI here
    }
  };

  const handleToggleReadSingle = (mail) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        m.id === mail.id ? { ...m, read: !m.read } : m
      ),
    }));
  };

  const handleToggleStar = (mailId) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        mailId === m.id ? { ...m, starred: !m.starred } : m
      ),
    }));
  };

  const handleBulkStar = (star) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        selectedMailIds.includes(m.id) ? { ...m, starred: star } : m
      ),
    }));
  };

  const handleToggleFlag = (mailId) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        mailId === m.id ? { ...m, flagged: !m.flagged } : m
      ),
    }));
  };

  const handleBulkFlag = (flag) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        selectedMailIds.includes(m.id) ? { ...m, flagged: flag } : m
      ),
    }));
  };

  const handleTogglePin = (mailId) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        mailId === m.id ? { ...m, pinned: !m.pinned } : m
      ),
    }));
  };

  const handleBulkPin = (pin) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        selectedMailIds.includes(m.id) ? { ...m, pinned: pin } : m
      ),
    }));
  };

  const handleBulkRead = (read) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        selectedMailIds.includes(m.id) ? { ...m, read } : m
      ),
    }));
  };

  const handleSelectMail = (mailId) => {
    setSelectedMailIds(ids =>
      ids.includes(mailId) ? ids.filter(id => id !== mailId) : [...ids, mailId]
    );
  };

  const handleSelectAll = (checked, mailIds) => {
    setSelectedMailIds(() => checked ? mailIds : []);
  };

  // Drag-and-drop handlers
  const handleDragStart = (mailId) => {
    setSelectedMailIds(ids => ids.includes(mailId) ? ids : [mailId]);
  };

  const handleDropOnFolder = (folder) => {
    if (selectedMailIds.length > 0 && folder !== selectedFolder) {
      handleMoveTo(folder);
    }
  };

  // Filter mails by search
  const mailsForSelectedFolder = mailData[selectedFolder] || [];
  const filteredMails = mailsForSelectedFolder.filter(mail =>
    mail.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort mails by date
  const sortedMails = filteredMails.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Convert to simple flat list format
  const conversations = sortedMails.map(mail => ({
    conversationId: `single_${mail.id}`,
    mails: [mail],
    latestMail: mail,
    unreadCount: mail.read ? 0 : 1,
    isExpanded: true,
  }));

  const handleOpenRules = () => setRulesOpen(true);
  const handleCloseRules = () => setRulesOpen(false);

  const handleDeleteMail = async (mailId) => {
    try {
      await deleteMail(mailId, selectedFolder);

      // If the deleted mail was selected, clear the selection
      if (selectedMail && selectedMail.id === mailId) {
        setSelectedMail(null);
      }

      // Remove from selected mail IDs if it was selected
      setSelectedMailIds(ids => ids.filter(id => id !== mailId));
    } catch (error) {
      // You could add error handling UI here
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Scheduled send effect - only for notifications

  useEffect(() => {
    // Add a small delay to ensure the app has loaded initial data
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        const now = new Date();

        // Get current state to check for upcoming emails
        const currentState = useStore.getState().mailData;

        // Don't run if there's no mailData yet
        if (!currentState || Object.keys(currentState).length === 0) {
          return;
        }

        // Check for emails that need notifications (4-5 minutes before sending)
        const scheduledEmails = currentState.Scheduled || [];
        scheduledEmails.forEach((m) => {
          if (!m.scheduledAt) return;

          const msLeft = new Date(m.scheduledAt) - now;
          if (
            !notifiedScheduledIds.includes(m.id) &&
            msLeft <= 5 * 60 * 1000 && // 5 minutes
            msLeft > 4 * 60 * 1000     // 4 minutes
          ) {
            // Show browser notification
            if (Notification.permission === "granted") {
              new Notification("Scheduled Email Reminder", {
                body: `Email to ${m.to} in ${(msLeft / 60000).toFixed(1)} min`
              });
            }

            // Show alert notification
            alert(`Scheduled Email Reminder: Email to ${m.to}${m.subject ? `: ${m.subject}` : ""} will be sent in 5 minutes.`);

            // Mark as notified
            setNotifiedScheduledIds((ids) => [...ids, m.id]);
          }
        });
      }, 10000); // check every 10 seconds

      return () => clearInterval(interval);
    }, 5000); // Wait 5 seconds before starting the interval

    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line
  }, [notifiedScheduledIds]);

  const handleEditScheduled = (mail) => {
    setMailData(prev => ensureAllFolders({
      ...prev,
      Scheduled: prev.Scheduled.filter(m => m.id !== mail.id),
    }));
    setEditScheduledMail(mail);
    setComposeOpen(true);
  };

  const handleCancelScheduled = (mail) => {
    setMailData(prev => ensureAllFolders({
      ...prev,
      Scheduled: prev.Scheduled.filter(m => m.id !== mail.id),
    }));
    setLastCanceledScheduled(mail);
    setUndoSnackbarOpen(true);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      // Actually delete from backend if not undone
      deleteMail(mail.id, 'Scheduled');
      setLastCanceledScheduled(null);
      setUndoSnackbarOpen(false);
    }, 5000); // 5 seconds to undo
  };

  const handleUndoCancel = () => {
    if (lastCanceledScheduled) {
      setMailData(prev => ensureAllFolders({
        ...prev,
        Scheduled: [lastCanceledScheduled, ...prev.Scheduled],
      }));
    }
    setUndoSnackbarOpen(false);
    setLastCanceledScheduled(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  // Add loading state for folder fetches
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const fetchMap = {
      'Drafts': fetchDrafts,
      'Inbox': fetchInbox,
      'Sent': fetchSent,
      'Deleted': fetchDeleted,
      'Junk': fetchJunk,
      'Archive': fetchArchive,
      'Scheduled': fetchScheduled,
  };
    const fetchFn = fetchMap[selectedFolder];
    if (fetchFn) {
      Promise.resolve(fetchFn()).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [selectedFolder, fetchDrafts, fetchInbox, fetchSent, fetchDeleted, fetchJunk, fetchArchive, fetchScheduled]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-layout" style={{ background: theme.palette.background.default }}>
        <Sidebar selectedFolder={selectedFolder} onSelectFolder={handleFolderSelect} onDropOnFolder={handleDropOnFolder} />
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
        <div className="main-section">
          <Header
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onCompose={handleComposeOpen}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenRules={handleOpenRules}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <span>Loading...</span>
            </div>
          ) : null}
          <MainContent
            mails={conversations}
            selectedMail={selectedMail}
            onMailSelect={handleMailSelect}
            onReply={handleReply}
            onDelete={handleDelete}
            onMoveTo={handleMoveTo}
            onToggleRead={handleToggleReadSingle}
            onToggleStar={handleToggleStar}
            onBulkStar={handleBulkStar}
            onToggleFlag={handleToggleFlag}
            onBulkFlag={handleBulkFlag}
            onTogglePin={handleTogglePin}
            onBulkPin={handleBulkPin}
            onBulkRead={handleBulkRead}
            onDeleteMail={handleDeleteMail}
            onSelectMail={handleSelectMail}
            onSelectAll={handleSelectAll}
            selectedMailIds={selectedMailIds}
            selectedFolder={selectedFolder}
            conversations={conversations}
            onEditScheduled={handleEditScheduled}
            onCancelScheduled={handleCancelScheduled}
          />
          <ComposeModal
            open={composeOpen}
            onClose={handleComposeClose}
            onSend={handleSendMail}
            replyTo={replyTo}
            {...(editScheduledMail ? {
              to: editScheduledMail.to,
              cc: editScheduledMail.cc,
              subject: editScheduledMail.subject,
              body: editScheduledMail.body,
              attachments: editScheduledMail.attachments,
              scheduledAt: editScheduledMail.scheduledAt,
            } : {})}
          />
          <RulesModal
            open={rulesOpen}
            onClose={handleCloseRules}
            rules={rules}
            setRules={setRules}
          />
          <Snackbar
            open={undoSnackbarOpen}
            autoHideDuration={5000}
            onClose={() => setUndoSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={handleUndoCancel}>
                  UNDO
                </Button>
              }
              sx={{ width: '100%' }}
            >
              Scheduled email canceled
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
