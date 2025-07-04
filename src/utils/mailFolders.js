export const allFolders = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];

export function ensureAllFolders(data) {
    const result = { ...data };
    allFolders.forEach(f => {
        if (!result[f]) result[f] = [];
    });
    return result;
} 