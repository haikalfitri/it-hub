export interface Faq {
  q: string
  a: string
  category: string
}

export const FAQS: Faq[] = [
  { q: 'How long does IT take to respond to a ticket?', a: 'High-priority tickets get a first response within 1 business hour, medium within 4 hours and low within 1 business day.', category: 'Service Desk' },
  { q: 'How often do I need to change my password?', a: 'You do not need to change it on a schedule. Change it straight away if you think someone else knows it. Passphrases must be at least 12 characters.', category: 'Accounts & security' },
  { q: 'Can I install software myself?', a: 'Yes, from the Company Portal app for approved free software. Anything else needs a Software ticket so IT can check licensing and security.', category: 'Requests & policies' },
  { q: 'What happens to my laptop when I leave the company?', a: 'Submit the Laptop surrender & undertaking form before your last day. IT checks the serial number and returns the laptop to stock.', category: 'Requests & policies' },
  { q: 'How do I get a new monitor, phone or laptop?', a: 'Use the Equipment request workflow. Your manager approves it and IT assigns an item from stock, usually within 2 business days.', category: 'Requests & policies' },
  { q: 'I deleted a file by mistake. Can I get it back?', a: 'Files saved in OneDrive or SharePoint stay in the Recycle bin for 90 days. Shared drive files can be restored by IT from the nightly backup.', category: 'Devices & printing' },
  { q: 'Can I use my personal phone for work email?', a: 'Yes. Install Outlook and Teams from the app store and sign in with your work account. Your work data stays separate from personal apps.', category: 'Accounts & security' },
  { q: 'Who approves access to a system?', a: 'Your line manager approves the business need, then the system owner grants the access. You can follow each step in Workflows.', category: 'Requests & policies' },
  { q: 'Why does the VPN disconnect when my laptop sleeps?', a: 'The VPN drops when the network does. It reconnects by itself when the laptop wakes. If it does not, disconnect and connect again.', category: 'Connectivity' },
  { q: 'Where can I see the status of my request?', a: 'Open Workflows and choose "My requests". Each request shows who it is waiting on, and its linked Service Desk ticket updates automatically.', category: 'Service Desk' },
]
