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

const folderNames = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];

const mockMailDataInit = {
  Inbox: [
    // Today (June 19, 2025)
    { id: 28, subject: 'Coffee Chat Invitation', sender: 'Colleague', body: 'Want to grab coffee this afternoon? I have some ideas to discuss.', date: '2025-06-19', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv13' },
    { id: 29, subject: 'Re: Coffee Chat Invitation', sender: 'You', body: 'Sounds great! 3pm at the usual place?', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv13' },
    { id: 30, subject: 'Re: Re: Coffee Chat Invitation', sender: 'Colleague', body: 'Perfect! See you there.', date: '2025-06-19', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv13' },
    { id: 64, subject: 'Daily Standup Reminder', sender: 'Team Lead', body: 'Don\'t forget our daily standup at 9am today.', date: '2025-06-19', read: false, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv27' },
    { id: 65, subject: 'Re: Daily Standup Reminder', sender: 'You', body: 'I\'ll be there. Have some updates to share.', date: '2025-06-19', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv27' },
    { id: 66, subject: 'Lunch Meeting', sender: 'Sales Manager', body: 'Can we meet for lunch today to discuss the new client proposal?', date: '2025-06-19', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv28' },
    { id: 67, subject: 'Re: Lunch Meeting', sender: 'You', body: 'Absolutely! 12:30pm at the usual restaurant?', date: '2025-06-19', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv28' },
    { id: 68, subject: 'System Update Complete', sender: 'IT Support', body: 'The system maintenance has been completed successfully.', date: '2025-06-19', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv29' },

    // Yesterday (June 18, 2025)
    { id: 24, subject: 'Office Supplies Order', sender: 'Admin Assistant', body: 'Your office supplies order has been processed and will arrive tomorrow.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv11' },
    { id: 25, subject: 'Re: Office Supplies Order', sender: 'You', body: 'Thank you! I was running low on notebooks.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv11' },
    { id: 26, subject: 'Holiday Schedule Update', sender: 'HR Department', body: 'Updated holiday schedule for the upcoming quarter. Please review.', date: '2025-06-18', read: false, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv12' },
    { id: 27, subject: 'Re: Holiday Schedule Update', sender: 'You', body: 'Thanks for the update. I\'ll plan my vacation accordingly.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv12' },
    { id: 69, subject: 'Project Deadline Extension', sender: 'Project Manager', body: 'Good news! We\'ve been granted a 2-week extension on the current project.', date: '2025-06-18', read: false, starred: true, flagged: true, reminder: null, pinned: false, conversationId: 'conv30' },
    { id: 70, subject: 'Re: Project Deadline Extension', sender: 'You', body: 'That\'s great! This gives us more time to polish the deliverables.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv30' },
    { id: 71, subject: 'Team Building Feedback', sender: 'Events Coordinator', body: 'Please share your feedback on last week\'s team building event.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv31' },
    { id: 72, subject: 'Re: Team Building Feedback', sender: 'You', body: 'It was fantastic! The activities were well-organized and fun.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, },

    // This Week (June 16-17, 2025) - Sunday and Monday
    { id: 7, subject: 'Project Update', sender: 'Team Lead', body: 'Here\'s the latest update on our project progress. We\'re ahead of schedule!', date: '2025-06-17', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv3' },
    { id: 8, subject: 'Re: Project Update', sender: 'You', body: 'Thanks for the update. I\'ll review it and get back to you with my feedback.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv3' },
    { id: 9, subject: 'Re: Re: Project Update', sender: 'Team Lead', body: 'Perfect! Let me know if you have any questions or concerns.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv3' },
    { id: 10, subject: 'Weekly Newsletter', sender: 'Marketing Team', body: 'Check out this week\'s latest updates and news from our marketing department.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv4' },
    { id: 13, subject: 'Budget Approval Required', sender: 'Finance Department', body: 'Please review and approve the Q2 budget allocation for your department.', date: '2025-06-17', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv6' },
    { id: 14, subject: 'Re: Budget Approval Required', sender: 'You', body: 'I\'ve reviewed the budget. Everything looks good. Approved.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv6' },
    { id: 15, subject: 'Team Building Event', sender: 'Events Coordinator', body: 'Join us for our monthly team building event this Friday at 3pm.', date: '2025-06-16', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv7' },
    { id: 16, subject: 'Re: Team Building Event', sender: 'You', body: 'I\'ll be there! Looking forward to it.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv7' },
    { id: 17, subject: 'Re: Re: Team Building Event', sender: 'Events Coordinator', body: 'Excellent! We\'ll have pizza and games. See you there!', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv7' },
    { id: 18, subject: 'System Maintenance Notice', sender: 'IT Support', body: 'Scheduled maintenance this weekend. System will be down from 2-4am.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv8' },
    { id: 19, subject: 'New Client Meeting', sender: 'Sales Manager', body: 'We have a new client meeting scheduled for next Tuesday at 2pm.', date: '2025-06-16', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv9' },
    { id: 20, subject: 'Re: New Client Meeting', sender: 'You', body: 'I\'ll prepare the presentation. What\'s the client\'s background?', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv9' },
    { id: 21, subject: 'Re: Re: New Client Meeting', sender: 'Sales Manager', body: 'They\'re a tech startup looking for our consulting services. I\'ll send you the details.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv9' },
    { id: 22, subject: 'Monthly Report Due', sender: 'Management', body: 'Please submit your monthly report by the end of this week.', date: '2025-06-16', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv10' },
    { id: 23, subject: 'Re: Monthly Report Due', sender: 'You', body: 'I\'ll have it ready by Friday. Working on the final details now.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv10' },
    { id: 73, subject: 'Code Review Request', sender: 'Developer', body: 'Can you review the latest code changes for the new feature?', date: '2025-06-16', read: false, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv32' },
    { id: 74, subject: 'Re: Code Review Request', sender: 'You', body: 'I\'ll review it this afternoon. Thanks for the heads up.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv32' },
    { id: 75, subject: 'Training Session Reminder', sender: 'HR Department', body: 'Reminder: New software training session tomorrow at 10am.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv33' },

    // Last Week (June 9-15, 2025)
    { id: 39, subject: 'Last Week\'s Summary', sender: 'Team Lead', body: 'Here\'s a summary of what we accomplished last week.', date: '2025-06-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv15' },
    { id: 40, subject: 'Re: Last Week\'s Summary', sender: 'You', body: 'Thanks for the summary. Everything looks good.', date: '2025-06-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv15' },
    { id: 41, subject: 'Weekend Plans', sender: 'Colleague', body: 'Any plans for the weekend? Thinking of organizing a team dinner.', date: '2025-06-14', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv16' },
    { id: 42, subject: 'Re: Weekend Plans', sender: 'You', body: 'Sounds great! I\'m free on Saturday.', date: '2025-06-14', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv16' },
    { id: 76, subject: 'Friday Team Lunch', sender: 'Team Lead', body: 'Let\'s have a team lunch this Friday to celebrate our achievements.', date: '2025-06-14', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv34' },
    { id: 77, subject: 'Re: Friday Team Lunch', sender: 'You', body: 'Count me in! Where should we go?', date: '2025-06-14', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv34' },
    { id: 78, subject: 'Project Milestone Reached', sender: 'Project Manager', body: 'Great news! We\'ve reached our Q2 milestone ahead of schedule.', date: '2025-06-13', read: false, starred: true, flagged: true, reminder: null, pinned: false, conversationId: 'conv35' },
    { id: 79, subject: 'Re: Project Milestone Reached', sender: 'You', body: 'Excellent work everyone! This is a great achievement.', date: '2025-06-13', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv35' },
    { id: 80, subject: 'Client Feedback', sender: 'Sales Manager', body: 'The client loved our latest deliverable. Great job team!', date: '2025-06-12', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv36' },
    { id: 81, subject: 'Re: Client Feedback', sender: 'You', body: 'That\'s fantastic! Their satisfaction is our priority.', date: '2025-06-12', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv36' },
    { id: 82, subject: 'System Upgrade Complete', sender: 'IT Support', body: 'The system upgrade has been completed successfully. All features are now available.', date: '2025-06-11', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv37' },

    // This Month (June 1-15, 2025) - Earlier June emails
    { id: 43, subject: 'June Performance Review', sender: 'HR Department', body: 'Your June performance review is ready for your review.', date: '2025-06-10', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv17' },
    { id: 44, subject: 'Re: June Performance Review', sender: 'You', body: 'I\'ll review it and get back to you with any questions.', date: '2025-06-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv17' },
    { id: 45, subject: 'Monthly Team Meeting', sender: 'Management', body: 'Our monthly team meeting is scheduled for next week.', date: '2025-06-08', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv18' },
    { id: 83, subject: 'June Newsletter', sender: 'Marketing Team', body: 'Check out our June newsletter with the latest company updates and achievements.', date: '2025-06-05', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv38' },
    { id: 84, subject: 'Team Building Planning', sender: 'Events Coordinator', body: 'Let\'s plan our next team building event. Any suggestions?', date: '2025-06-03', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv39' },
    { id: 85, subject: 'Re: Team Building Planning', sender: 'You', body: 'How about an outdoor activity? Maybe a hiking trip?', date: '2025-06-03', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv39' },
    { id: 86, subject: 'Budget Review Meeting', sender: 'Finance Department', body: 'We need to schedule a budget review meeting for this month.', date: '2025-06-01', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv40' },
    { id: 87, subject: 'Re: Budget Review Meeting', sender: 'You', body: 'I\'m available next Tuesday at 2pm. Does that work?', date: '2025-06-01', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv40' },
    { id: 88, subject: 'New Software Training', sender: 'IT Support', body: 'New software training sessions are now available. Please sign up.', date: '2025-06-01', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv41' },

    // Last Month (May 2025)
    { id: 46, subject: 'May Newsletter', sender: 'Marketing Team', body: 'Check out our May newsletter with the latest company updates.', date: '2025-05-30', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv19' },
    { id: 47, subject: 'Q1 Results', sender: 'Finance Department', body: 'Q1 financial results are now available for review.', date: '2025-05-25', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv20' },
    { id: 89, subject: 'May Team Meeting', sender: 'Management', body: 'Our May team meeting is scheduled for this Friday.', date: '2025-05-20', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv42' },
    { id: 90, subject: 'Re: May Team Meeting', sender: 'You', body: 'I\'ll be there. Looking forward to the discussion.', date: '2025-05-20', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv42' },
    { id: 91, subject: 'Project Kickoff', sender: 'Project Manager', body: 'We\'re kicking off a new project next week. Please review the requirements.', date: '2025-05-15', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv43' },
    { id: 92, subject: 'Re: Project Kickoff', sender: 'You', body: 'I\'ve reviewed the requirements. Everything looks good to proceed.', date: '2025-05-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv43' },
    { id: 93, subject: 'Memorial Day Notice', sender: 'HR Department', body: 'Office will be closed for Memorial Day. Enjoy your time off!', date: '2025-05-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv44' },
    { id: 94, subject: 'System Maintenance', sender: 'IT Support', body: 'Scheduled system maintenance this weekend. Minimal downtime expected.', date: '2025-05-05', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv45' },

    // April 2025
    { id: 1, subject: 'Welcome to Outlook!', sender: 'Microsoft', body: 'Thanks for trying our Outlook replica. We hope you enjoy the experience.', date: '2025-04-15', read: false, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv1' },
    { id: 2, subject: 'Meeting Reminder', sender: 'HR Department', body: 'Don\'t forget the team meeting at 10am tomorrow. Please prepare your updates.', date: '2025-04-10', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv2' },
    { id: 5, subject: 'Re: Meeting Reminder', sender: 'You', body: 'I\'ll be there. Thanks for the reminder. I\'ll prepare my quarterly report.', date: '2025-04-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv2' },
    { id: 6, subject: 'Re: Re: Meeting Reminder', sender: 'HR Department', body: 'Great! Looking forward to seeing you. Don\'t forget to bring the project timeline.', date: '2025-04-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv2' },

    // March 2025
    { id: 52, subject: 'March Team Update', sender: 'Team Lead', body: 'Here\'s our March team update and accomplishments.', date: '2025-03-28', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv21' },
    { id: 53, subject: 'Re: March Team Update', sender: 'You', body: 'Great work everyone! March was very productive.', date: '2025-03-28', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv21' },
    { id: 54, subject: 'Spring Event', sender: 'Events Coordinator', body: 'Join us for our spring team celebration!', date: '2025-03-14', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv22' },

    // February 2025
    { id: 55, subject: 'February Goals', sender: 'Management', body: 'Let\'s discuss our team goals for February.', date: '2025-02-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv23' },
    { id: 56, subject: 'Re: February Goals', sender: 'You', body: 'I\'m excited about our goals for this month. Let\'s make it great!', date: '2025-02-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv23' },
    { id: 57, subject: 'February Newsletter', sender: 'Marketing Team', body: 'Check out our February newsletter.', date: '2025-02-05', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv24' },

    // January 2025
    { id: 58, subject: 'New Year Party Invitation', sender: 'HR Department', body: 'You\'re invited to our New Year celebration!', date: '2025-01-20', read: false, starred: true, flagged: false, reminder: null, pinned: false, conversationId: 'conv25' },
    { id: 59, subject: 'Re: New Year Party Invitation', sender: 'You', body: 'I\'ll be there! Looking forward to celebrating with the team.', date: '2025-01-20', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv25' },
    { id: 60, subject: 'Year-End Review', sender: 'Management', body: 'Please submit your year-end review by January 31st.', date: '2025-01-15', read: false, starred: false, flagged: true, reminder: null, pinned: false, conversationId: 'conv26' },
  ],
  Sent: [
    // Today
    { id: 37, subject: 'Re: Coffee Chat Invitation', sender: 'You', body: 'Sounds great! 3pm at the usual place?', date: '2025-06-19', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv13' },

    // Yesterday
    { id: 35, subject: 'Re: Office Supplies Order', sender: 'You', body: 'Thank you! I was running low on notebooks.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv11' },
    { id: 36, subject: 'Re: Holiday Schedule Update', sender: 'You', body: 'Thanks for the update. I\'ll plan my vacation accordingly.', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv12' },

    // This Week
    { id: 12, subject: 'Re: Project Update', sender: 'You', body: 'Thanks for the update. I\'ll review it and get back to you with my feedback.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv3' },
    { id: 31, subject: 'Re: Budget Approval Required', sender: 'You', body: 'I\'ve reviewed the budget. Everything looks good. Approved.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv6' },
    { id: 32, subject: 'Re: Team Building Event', sender: 'You', body: 'I\'ll be there! Looking forward to it.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv7' },
    { id: 33, subject: 'Re: New Client Meeting', sender: 'You', body: 'I\'ll prepare the presentation. What\'s the client\'s background?', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv9' },
    { id: 34, subject: 'Re: Monthly Report Due', sender: 'You', body: 'I\'ll have it ready by Friday. Working on the final details now.', date: '2025-06-16', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv10' },

    // Last Week
    { id: 48, subject: 'Re: Last Week\'s Summary', sender: 'You', body: 'Thanks for the summary. Everything looks good.', date: '2025-06-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv15' },
    { id: 49, subject: 'Re: Weekend Plans', sender: 'You', body: 'Sounds great! I\'m free on Saturday.', date: '2025-06-14', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv16' },

    // This Month
    { id: 50, subject: 'Re: June Performance Review', sender: 'You', body: 'I\'ll review it and get back to you with any questions.', date: '2025-06-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv17' },

    // Last Month
    { id: 51, subject: 'Re: Q1 Results', sender: 'You', body: 'Thanks for sharing the Q1 results. They look promising.', date: '2025-05-25', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv20' },

    // March 2025
    { id: 3, subject: 'Re: Welcome', sender: 'You', body: 'Thank you! Looking forward to using this platform.', date: '2025-03-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv1' },
    { id: 11, subject: 'Re: Meeting Reminder', sender: 'You', body: 'I\'ll be there. Thanks for the reminder. I\'ll prepare my quarterly report.', date: '2025-03-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv2' },

    // February 2025
    { id: 61, subject: 'Re: February Goals', sender: 'You', body: 'I\'m excited about our goals for this month. Let\'s make it great!', date: '2025-02-15', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv23' },

    // January 2025
    { id: 62, subject: 'Re: New Year Party Invitation', sender: 'You', body: 'I\'ll be there! Looking forward to celebrating with the team.', date: '2025-01-20', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv25' },

    // December 2023
    { id: 63, subject: 'Re: Memorial Day Notice', sender: 'You', body: 'I\'ll be there! Looking forward to celebrating with the team.', date: '2025-05-10', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv44' },
  ],
  Drafts: [
    { id: 4, subject: 'Draft: Project Update', sender: 'You', body: 'Here is the latest update on our project progress. We have completed phase 1 and are moving into phase 2. The team has been working hard and we\'re on track to meet our deadlines.', date: '2025-06-17', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv5' },
    { id: 38, subject: 'Draft: Q2 Performance Review', sender: 'You', body: 'I\'m writing to provide my Q2 performance review. This quarter has been very productive with several key achievements...', date: '2025-06-18', read: true, starred: false, flagged: false, reminder: null, pinned: false, conversationId: 'conv14' },
  ],
  Deleted: [],
  Junk: [],
  Archive: [],
  Scheduled: [],
};

function App() {
  const [mailData, setMailData] = useState(mockMailDataInit);
  const [selectedFolder, setSelectedFolder] = useState('Inbox');
  const [selectedMail, setSelectedMail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMailIds, setSelectedMailIds] = useState([]); // for multi-select
  const [darkMode, setDarkMode] = useState(false);
  const [rules, setRules] = useState([]); // rules array
  const [rulesOpen, setRulesOpen] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState(new Set()); // Track expanded conversations
  const [groupByConversation, setGroupByConversation] = useState(true); // Toggle between conversation and date grouping
  const [sortBy, setSortBy] = useState('newest'); // Sort by date: 'newest' or 'oldest'
  const [editScheduledMail, setEditScheduledMail] = useState(null);
  const [notifiedScheduledIds, setNotifiedScheduledIds] = useState([]);

  const allFolders = ['Inbox', 'Sent', 'Drafts', 'Deleted', 'Junk', 'Archive', 'Scheduled'];
  const ensureAllFolders = (data) => {
    const result = { ...data };
    allFolders.forEach(f => {
      if (!result[f]) result[f] = [];
    });
    return result;
  };

  // Group mails by conversation
  const groupMailsByConversation = (mails) => {
    const conversations = {};

    mails.forEach(mail => {
      const convId = mail.conversationId || `single_${mail.id}`;
      if (!conversations[convId]) {
        conversations[convId] = [];
      }
      conversations[convId].push(mail);
    });

    // Sort conversations by latest email date
    const sortedConversations = Object.entries(conversations)
      .map(([convId, convMails]) => ({
        conversationId: convId,
        mails: convMails.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        }),
        latestMail: convMails[0], // First after sorting by date
        unreadCount: convMails.filter(m => !m.read).length,
        isExpanded: expandedConversations.has(convId)
      }))
      .sort((a, b) => {
        const dateA = new Date(a.latestMail.date);
        const dateB = new Date(b.latestMail.date);
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });

    return sortedConversations;
  };

  // Group mails by date
  const groupMailsByDate = (mails) => {
    const dateGroups = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Last Week': [],
      'This Month': [],
      'Last Month': [],
    };

    // Use fixed reference date of June 19, 2025 to match mock data
    // Create dates using YYYY-MM-DD format to avoid timezone issues
    const today = new Date('2025-06-19T00:00:00');
    const yesterday = new Date('2025-06-18T00:00:00');

    const startOfWeek = new Date('2025-06-15T00:00:00'); // Sunday June 15, 2025
    const startOfLastWeek = new Date('2025-06-08T00:00:00'); // Sunday June 8, 2025
    const startOfMonth = new Date('2025-06-01T00:00:00'); // June 1, 2025
    const startOfLastMonth = new Date('2025-05-01T00:00:00'); // May 1, 2025

    mails.forEach(mail => {
      // Parse mail date using the same format
      const mailDate = new Date(mail.date + 'T00:00:00');

      if (mailDate.getTime() === today.getTime()) {
        dateGroups['Today'].push(mail);
      } else if (mailDate.getTime() === yesterday.getTime()) {
        dateGroups['Yesterday'].push(mail);
      } else if (mailDate >= startOfWeek && mailDate < today) {
        dateGroups['This Week'].push(mail);
      } else if (mailDate >= startOfLastWeek && mailDate < startOfWeek) {
        dateGroups['Last Week'].push(mail);
      } else if (mailDate >= startOfMonth && mailDate < startOfWeek) {
        dateGroups['This Month'].push(mail);
      } else if (mailDate >= startOfLastMonth && mailDate < startOfMonth) {
        dateGroups['Last Month'].push(mail);
      } else {
        // Group by individual months for older emails
        const monthKey = mailDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
        if (!dateGroups[monthKey]) {
          dateGroups[monthKey] = [];
        }
        dateGroups[monthKey].push(mail);
      }
    });

    // Convert to array format and filter out empty groups
    return Object.entries(dateGroups)
      .filter(([_, dateMails]) => dateMails.length > 0)
      .map(([dateRange, dateMails]) => ({
        conversationId: `date_${dateRange}`,
        mails: dateMails.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        }),
        latestMail: dateMails[0], // First after sorting by date
        unreadCount: dateMails.filter(m => !m.read).length,
        isExpanded: expandedConversations.has(`date_${dateRange}`),
        date: dateRange
      }))
      .sort((a, b) => {
        // Custom sorting: Today, Yesterday, This Week, Last Week, This Month, Last Month, then months chronologically
        const order = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'];
        const aIndex = order.indexOf(a.date);
        const bIndex = order.indexOf(b.date);

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        } else if (aIndex !== -1) {
          return -1;
        } else if (bIndex !== -1) {
          return 1;
        } else {
          // For months, sort by date (respecting sortBy preference)
          const dateA = new Date(a.latestMail.date);
          const dateB = new Date(b.latestMail.date);
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        }
      });
  };

  const toggleGrouping = () => {
    setGroupByConversation(!groupByConversation);
    setExpandedConversations(new Set()); // Reset expanded state when switching grouping
  };

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
    setSelectedMail(null);
    setSelectedMailIds([]);
    if (folder === 'Scheduled') {
      setGroupByConversation(false);
    }
  };

  const handleMailSelect = (mail) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].map(m =>
        m.id === mail.id ? { ...m, read: true } : m
      ),
    }));
    setSelectedMail({ ...mail, read: true });
    setSelectedMailIds([]);
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
    setMailData(prev => applyRulesToAllMails(prev));
    // eslint-disable-next-line
  }, [rules]);

  const handleSendMail = (mail) => {
    if (mail.scheduledAt && new Date(mail.scheduledAt) > new Date()) {
      // Scheduled send: add to Scheduled folder
      const scheduledMail = {
        ...mail,
        id: Date.now(),
        sender: 'You',
        date: mail.scheduledAt ? new Date(mail.scheduledAt).toLocaleString() : new Date().toLocaleString(),
        read: true,
        starred: false,
        flagged: false,
        reminder: null,
        attachments: mail.attachments || [],
        cc: mail.cc || '',
      };
      setMailData(prev => ensureAllFolders({
        ...prev,
        Scheduled: [scheduledMail, ...(prev.Scheduled || [])],
      }));
      setComposeOpen(false);
      setReplyTo(null);
      setEditScheduledMail(null);
      setSelectedFolder('Scheduled');
      return;
    }
    // Immediate send
    const { mail: processedMail, folder: processedFolder } = applyRulesToMail(
      {
        ...mail,
        id: Date.now(),
        sender: 'You',
        date: new Date().toLocaleString(),
        read: true,
        starred: false,
        flagged: false,
        reminder: null,
        attachments: mail.attachments || [],
        cc: mail.cc || '',
      },
      'Sent'
    );
    setMailData(prev => ensureAllFolders({
      ...prev,
      [processedFolder]: [processedMail, ...(prev[processedFolder] || [])],
    }));
    setComposeOpen(false);
    setReplyTo(null);
    setEditScheduledMail(null);
    setSelectedFolder(processedFolder);
  };

  const handleDelete = () => {
    let idsToDelete = selectedMailIds.length > 0 ? selectedMailIds : (selectedMail ? [selectedMail.id] : []);
    setMailData(prev => ensureAllFolders({
      ...prev,
      [selectedFolder]: prev[selectedFolder].filter(m => !idsToDelete.includes(m.id)),
    }));
    setSelectedMail(null);
    setSelectedMailIds([]);
  };

  const handleMoveTo = (targetFolder) => {
    let idsToMove = selectedMailIds.length > 0 ? selectedMailIds : (selectedMail ? [selectedMail.id] : []);
    setMailData(prev => {
      const mailsToMove = prev[selectedFolder].filter(m => idsToMove.includes(m.id));
      if (!mailsToMove.length) return ensureAllFolders(prev);
      return ensureAllFolders({
        ...prev,
        [selectedFolder]: prev[selectedFolder].filter(m => !idsToMove.includes(m.id)),
        [targetFolder]: [...mailsToMove, ...(prev[targetFolder] || [])],
      });
    });
    setSelectedMail(null);
    setSelectedMailIds([]);
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
    setSelectedMailIds(checked ? mailIds : []);
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
  const filteredMails = (mailData[selectedFolder] || []).filter(mail =>
    mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered mails by conversation or date
  const conversations = selectedFolder === 'Scheduled'
    ? (filteredMails.map(mail => ({
      conversationId: `single_${mail.id}`,
      mails: [mail],
      latestMail: mail,
      unreadCount: mail.read ? 0 : 1,
      isExpanded: true,
    })))
    : (groupByConversation ? groupMailsByConversation(filteredMails) : groupMailsByDate(filteredMails));

  const handleOpenRules = () => setRulesOpen(true);
  const handleCloseRules = () => setRulesOpen(false);

  const handleDeleteMail = (mailId) => {
    setMailData(prev => ({
      ...prev,
      [selectedFolder]: prev[selectedFolder].filter(m => m.id !== mailId),
    }));
  };

  const toggleConversation = (conversationId) => {
    setExpandedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
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

  // Scheduled send effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMailData(prev => {
        const now = new Date();
        const dueMails = (prev.Scheduled || []).filter(m => {
          const scheduledTime = new Date(m.scheduledAt);
          const isDue = scheduledTime <= now;
          if (isDue) {
            console.log(`Moving scheduled email to Sent: ${m.subject} (scheduled for ${m.scheduledAt}, now is ${now.toLocaleString()})`);
          }
          return m.scheduledAt && isDue;
        });
        // Notification logic: find mails 4-5 min from send, not yet notified
        (prev.Scheduled || []).forEach(m => {
          const msLeft = new Date(m.scheduledAt) - now;
          if (
            m.scheduledAt &&
            !notifiedScheduledIds.includes(m.id) &&
            msLeft <= 5 * 60 * 1000 &&
            msLeft > 4 * 60 * 1000 // 4-5 min window
          ) {
            console.log(`Notification: Email to ${m.to}${m.subject ? `: ${m.subject}` : ''} will be sent in ${(msLeft / 60000).toFixed(2)} minutes.`);
            console.log('permission ', Notification.permission);
            if (window.Notification && Notification.permission === 'granted') {
              new Notification('Scheduled Email Reminder', {
                body: `Email to ${m.to}${m.subject ? `: ${m.subject}` : ''} will be sent in 5 minutes.`
              });
            }
            setNotifiedScheduledIds(ids => [...ids, m.id]);
          }
        });
        if (dueMails.length === 0) return ensureAllFolders(prev);
        return ensureAllFolders({
          ...prev,
          Scheduled: (prev.Scheduled || []).filter(m => !(m.scheduledAt && new Date(m.scheduledAt) <= now)),
          Sent: [
            ...dueMails.map(m => ({ ...m, scheduledAt: undefined, date: new Date().toLocaleString() })),
            ...(prev.Sent || [])
          ],
        });
      });
    }, 10000); // check every 10 seconds
    return () => clearInterval(interval);
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
  };

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
            toggleConversation={toggleConversation}
            groupByConversation={groupByConversation}
            toggleGrouping={toggleGrouping}
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
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
