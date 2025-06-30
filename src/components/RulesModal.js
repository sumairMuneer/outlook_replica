import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const folderOptions = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive'];

const RulesModal = ({ open, onClose, rules, setRules }) => {
    const [conditionType, setConditionType] = useState('sender');
    const [conditionValue, setConditionValue] = useState('');
    const [actionType, setActionType] = useState('move');
    const [actionValue, setActionValue] = useState('Inbox');

    const handleAddRule = () => {
        if (!conditionValue) return;
        setRules(prev => [
            ...prev,
            {
                id: Date.now(),
                conditionType,
                conditionValue,
                actionType,
                actionValue,
            },
        ]);
        setConditionValue('');
    };

    const handleDeleteRule = (id) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Rules & Filters</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Create a rule to automatically organize your mail.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Select
                        value={conditionType}
                        onChange={e => setConditionType(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="sender">Sender</MenuItem>
                        <MenuItem value="subject">Subject contains</MenuItem>
                    </Select>
                    <TextField
                        value={conditionValue}
                        onChange={e => setConditionValue(e.target.value)}
                        size="small"
                        placeholder={conditionType === 'sender' ? 'e.g. HR' : 'e.g. Invoice'}
                        sx={{ flex: 1 }}
                    />
                    <Select
                        value={actionType}
                        onChange={e => setActionType(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="move">Move to</MenuItem>
                        <MenuItem value="read">Mark as read</MenuItem>
                        <MenuItem value="star">Mark as starred</MenuItem>
                    </Select>
                    {actionType === 'move' ? (
                        <Select
                            value={actionValue}
                            onChange={e => setActionValue(e.target.value)}
                            size="small"
                        >
                            {folderOptions.map(f => (
                                <MenuItem key={f} value={f}>{f}</MenuItem>
                            ))}
                        </Select>
                    ) : null}
                    <Button variant="contained" onClick={handleAddRule} sx={{ minWidth: 90 }}>
                        Add
                    </Button>
                </Box>
                <Box>
                    {rules.length === 0 && <Typography color="text.secondary">No rules yet.</Typography>}
                    {rules.map(rule => (
                        <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                            <Typography sx={{ flex: 1 }}>
                                If <b>{rule.conditionType === 'sender' ? 'sender' : 'subject contains'}</b> <b>"{rule.conditionValue}"</b>,&nbsp;
                                <b>{rule.actionType === 'move' ? `move to ${rule.actionValue}` : rule.actionType === 'read' ? 'mark as read' : 'mark as starred'}</b>
                            </Typography>
                            <IconButton onClick={() => handleDeleteRule(rule.id)} size="small">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RulesModal; 