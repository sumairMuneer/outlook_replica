import { create } from 'zustand';
import axios from 'axios';
import { ensureAllFolders } from './utils/mailFolders';

axios.defaults.baseURL = 'http://localhost:5001';

const folderNames = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];

const initialFolder = localStorage.getItem('selectedFolder') || 'Inbox';

const useStore = create((set, get) => ({
    mailData: ensureAllFolders({}),
    selectedFolder: initialFolder,
    selectedMail: null,
    searchQuery: '',
    composeOpen: false,
    replyTo: null,
    selectedMailIds: [],
    darkMode: false,
    rules: [],
    rulesOpen: false,
    sortBy: 'newest',
    editScheduledMail: null,
    notifiedScheduledIds: [],

    // Async actions
    fetchMails: async (folder = 'Inbox', search = '') => {
        const res = await axios.get('/mails', { params: { folder, search } });
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => ({
            mailData: ensureAllFolders({ ...state.mailData, [folder]: mails }),
        }));
    },
    fetchRules: async () => {
        const res = await axios.get('/rules');
        set({ rules: res.data });
    },
    fetchInbox: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails/inbox');
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Inbox: mails }),
                selectedMail,
            };
        });
    },
    fetchSent: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails/sent');
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Sent: mails }),
                selectedMail,
            };
        });
    },
    fetchDeleted: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails/deleted');
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Deleted: mails }),
                selectedMail,
            };
        });
    },
    fetchJunk: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails', { params: { folder: 'Junk' } });
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Junk: mails }),
                selectedMail,
            };
        });
    },
    fetchArchive: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails', { params: { folder: 'Archive' } });
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Archive: mails }),
                selectedMail,
            };
        });
    },
    fetchScheduled: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails/scheduled');
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Scheduled: mails }),
                selectedMail,
            };
        });
    },
    sendMail: async (mail) => {
        try {
            // Check if this is a scheduled email that's now due
            if (mail.scheduledAt && new Date(mail.scheduledAt) <= new Date()) {
                // Scheduled email is due - send it immediately using the sent endpoint
                const res = await axios.post('/mails/sent', {
                    ...mail,
                    scheduledAt: undefined // Remove scheduledAt since we're sending now
                });
                // Don't call fetchSent() here to avoid interfering with other folders
                // The local state will be updated by the interval
                return res.data;
            } else if (!mail.scheduledAt) {
                // Immediate send: use the dedicated sent email endpoint
                const res = await axios.post('/mails/sent', mail);
                await get().fetchSent();
                return res.data;
            } else {
                // Future scheduled send: use the general endpoint to save to Scheduled folder
                const res = await axios.post('/mails', mail);
                await get().fetchScheduled();
                return res.data;
            }
        } catch (error) {
            console.error('Error sending mail:', error);
            throw error;
        }
    },
    deleteMail: async (id, folder) => {
        await axios.delete(`/mails/${id}`);
        // Use specific fetch functions instead of fetchMails to avoid interfering with other folders
        const fetchMap = {
            'Inbox': get().fetchInbox,
            'Sent': get().fetchSent,
            'Drafts': get().fetchDrafts,
            'Deleted': get().fetchDeleted,
            'Junk': get().fetchJunk,
            'Archive': get().fetchArchive,
            'Scheduled': get().fetchScheduled,
        };
        const fetchFn = fetchMap[folder];
        if (fetchFn) {
            await fetchFn();
        }
    },
    updateMail: async (id, data, folder) => {
        await axios.put(`/mails/${id}`, data);
        // Use specific fetch functions instead of fetchMails to avoid interfering with other folders
        const fetchMap = {
            'Inbox': get().fetchInbox,
            'Sent': get().fetchSent,
            'Drafts': get().fetchDrafts,
            'Deleted': get().fetchDeleted,
            'Junk': get().fetchJunk,
            'Archive': get().fetchArchive,
            'Scheduled': get().fetchScheduled,
        };
        const fetchFn = fetchMap[folder];
        if (fetchFn) {
            await fetchFn();
        }
    },
    bulkAction: async (ids, action, value, folder) => {
        await axios.post('/mails/bulk', { ids, action, value });
        // Use specific fetch functions instead of fetchMails to avoid interfering with other folders
        const fetchMap = {
            'Inbox': get().fetchInbox,
            'Sent': get().fetchSent,
            'Drafts': get().fetchDrafts,
            'Deleted': get().fetchDeleted,
            'Junk': get().fetchJunk,
            'Archive': get().fetchArchive,
            'Scheduled': get().fetchScheduled,
        };
        const fetchFn = fetchMap[folder];
        if (fetchFn) {
            await fetchFn();
        }
    },
    createRule: async (rule) => {
        await axios.post('/rules', rule);
        get().fetchRules();
    },
    deleteRule: async (id) => {
        await axios.delete(`/rules/${id}`);
        get().fetchRules();
    },
    saveDraft: async (draft) => {
        const res = await axios.post('/mails/draft', draft);
        await get().fetchDrafts();
        return res.data;
    },
    fetchDrafts: async () => {
        const prevSelected = get().selectedMail;
        const res = await axios.get('/mails', { params: { folder: 'Drafts' } });
        const mails = res.data.map(mail => ({ ...mail, id: mail._id }));
        set(state => {
            let selectedMail = null;
            if (prevSelected) {
                selectedMail = mails.find(m => m.id === prevSelected.id) || null;
            }
            return {
                mailData: ensureAllFolders({ ...state.mailData, Drafts: mails }),
                selectedMail,
            };
        });
    },

    // UI actions
    setSelectedFolder: (folder) => {
        localStorage.setItem('selectedFolder', folder);
        set({ selectedFolder: folder, selectedMail: null, selectedMailIds: [] });
    },
    setSelectedMail: (mail) => set({ selectedMail: mail }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setComposeOpen: (open) => set({ composeOpen: open }),
    setReplyTo: (mail) => set({ replyTo: mail }),
    setSelectedMailIds: (ids) => set({ selectedMailIds: ids }),
    setDarkMode: (val) => set({ darkMode: val }),
    setRulesOpen: (open) => set({ rulesOpen: open }),
    setSortBy: (val) => set({ sortBy: val }),
    setEditScheduledMail: (mail) => set({ editScheduledMail: mail }),
    setNotifiedScheduledIds: (ids) => set({ notifiedScheduledIds: ids }),
    setMailData: (mailData) => {
        set({ mailData });
    },
}));

export default useStore; 