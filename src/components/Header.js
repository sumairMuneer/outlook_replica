import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import RuleIcon from '@mui/icons-material/Rule';

const Header = ({ searchQuery, onSearchChange, onCompose, darkMode, onToggleDarkMode, onOpenRules, sortBy, onSortChange }) => {
    return (
        <AppBar position="static" color="default" elevation={0} sx={{ background: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: { xs: 1, sm: 3 }, minHeight: 56, overflow: 'visible', minWidth: 0 }}>
                <TextField
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search mail"
                    size="small"
                    variant="outlined"
                    sx={{ width: 320, fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: 15, minWidth: 0 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="sort-select-label">Sort by</InputLabel>
                        <Select
                            labelId="sort-select-label"
                            value={sortBy}
                            label="Sort by"
                            onChange={(e) => onSortChange(e.target.value)}
                            sx={{
                                borderRadius: 6,
                                fontSize: 15,
                                '& .MuiSelect-select': {
                                    fontSize: 15,
                                    fontWeight: 500
                                }
                            }}
                        >
                            <MenuItem value="newest">Newest first</MenuItem>
                            <MenuItem value="oldest">Oldest first</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<RuleIcon />}
                        sx={{ borderRadius: 6, fontWeight: 500, fontSize: 15, textTransform: 'none', borderColor: '#0078d4', color: '#0078d4', ':hover': { borderColor: '#005fa3', color: '#005fa3' } }}
                        onClick={onOpenRules}
                    >
                        Rules
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#0078d4', borderRadius: 6, px: 3, fontWeight: 500, fontSize: 15, boxShadow: 'none', textTransform: 'none', ':hover': { bgcolor: '#005fa3' } }} onClick={onCompose}>
                        Compose
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, pr: { xs: 0.5, sm: 2 } }}>
                    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <Switch
                            checked={darkMode}
                            onChange={onToggleDarkMode}
                            color="default"
                            icon={<Brightness7Icon />}
                            checkedIcon={<Brightness4Icon />}
                            sx={{ mr: 0.5 }}
                        />
                    </Tooltip>
                    <Avatar sx={{ bgcolor: '#0078d4', width: 40, height: 40, fontWeight: 600, fontSize: 20, border: '2px solid #fff', boxShadow: 1 }}>
                        S
                    </Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 