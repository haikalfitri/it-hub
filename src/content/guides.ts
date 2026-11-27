export type GuideCategory = 'Accounts & security' | 'Connectivity' | 'Email & collaboration' | 'Devices & printing' | 'Requests & policies'

export interface Guide {
  slug: string
  title: string
  category: GuideCategory
  summary: string
  minutes: number
  steps: { title: string; body: string }[]
  related: string[]
  popular?: boolean
  /** Service Desk category to prefill when "Still stuck?" is used. */
  ticketCategory: string
}

export const GUIDE_CATEGORIES: GuideCategory[] = ['Accounts & security', 'Connectivity', 'Email & collaboration', 'Devices & printing', 'Requests & policies']

export const GUIDES: Guide[] = [
  {
    slug: 'vpn-from-home',
    title: 'Connect to the VPN from home',
    category: 'Connectivity',
    summary: 'Reach shared drives and internal systems securely when you are away from the office.',
    minutes: 3,
    popular: true,
    ticketCategory: 'Network & VPN',
    related: ['mfa-setup', 'office-wifi', 'shared-drive'],
    steps: [
      { title: 'Open the VPN client', body: 'Find "Company VPN" in the system tray (bottom-right of the taskbar). If it is missing, open it from the Start menu.' },
      { title: 'Sign in with your work account', body: 'Use your full work email address and password. Approve the sign-in on your authenticator app when asked.' },
      { title: 'Wait for "Connected"', body: 'The shield icon turns green. Shared drives and internal sites now work as if you were in the office.' },
      { title: 'Disconnect when you finish', body: 'Right-click the icon and choose Disconnect. Personal browsing does not need the VPN.' },
    ],
  },
  {
    slug: 'mfa-setup',
    title: 'Set up multi-factor authentication (MFA)',
    category: 'Accounts & security',
    summary: 'Protect your account with a second sign-in step using the authenticator app on your phone.',
    minutes: 5,
    popular: true,
    ticketCategory: 'Account & access',
    related: ['password-reset', 'report-phishing', 'new-laptop-first-login'],
    steps: [
      { title: 'Install the authenticator app', body: 'Download Microsoft Authenticator from the App Store or Google Play on your phone.' },
      { title: 'Start registration on your computer', body: 'Go to your account security page and choose "Add sign-in method", then "Authenticator app".' },
      { title: 'Scan the QR code', body: 'In the app, tap + then "Work or school account" and scan the code shown on screen.' },
      { title: 'Approve the test notification', body: 'Approve the test prompt on your phone. From now on you will confirm new sign-ins this way.' },
      { title: 'Changed phones?', body: 'Raise a ticket before you wipe your old phone so IT can move your MFA to the new one.' },
    ],
  },
  {
    slug: 'password-reset',
    title: 'Reset a forgotten password',
    category: 'Accounts & security',
    summary: 'Reset your own password in a few minutes without waiting for IT.',
    minutes: 2,
    ticketCategory: 'Account & access',
    related: ['mfa-setup', 'new-laptop-first-login'],
    steps: [
      { title: 'Open the reset page', body: 'On the sign-in screen, choose "Forgot my password".' },
      { title: 'Verify it is you', body: 'Confirm with your authenticator app or the phone number you registered.' },
      { title: 'Choose a strong passphrase', body: 'Use at least 12 characters. Three random words with a number is easy to remember and hard to guess.' },
      { title: 'Sign in again everywhere', body: 'Your laptop, phone email and Teams will ask for the new password. Update each one to avoid lock-outs.' },
    ],
  },
  {
    slug: 'printer-setup',
    title: 'Add an office printer',
    category: 'Devices & printing',
    summary: 'Add the printer nearest to you and print securely with your staff badge.',
    minutes: 3,
    ticketCategory: 'Printing',
    related: ['new-laptop-first-login', 'office-wifi'],
    steps: [
      { title: 'Open Printers & scanners', body: 'Go to Settings, then Bluetooth & devices, then Printers & scanners.' },
      { title: 'Add the floor printer', body: 'Choose "Add device". Office printers are named by floor, for example "L3-Printer".' },
      { title: 'Print as normal', body: 'Your job waits on the printer until you release it.' },
      { title: 'Release with your badge', body: 'Tap your staff badge on the printer reader to print. Unreleased jobs clear after 24 hours.' },
    ],
  },
  {
    slug: 'outlook-signature-shared-mailbox',
    title: 'Outlook signature and shared mailboxes',
    category: 'Email & collaboration',
    summary: 'Set the standard email signature and open a shared team mailbox.',
    minutes: 4,
    ticketCategory: 'Email',
    related: ['teams-meetings', 'report-phishing'],
    steps: [
      { title: 'Create your signature', body: 'In Outlook, open Settings, then Mail, then Signatures. Use your name, title, department and phone number.' },
      { title: 'Set it as default', body: 'Choose the signature for new messages and for replies and forwards.' },
      { title: 'Open a shared mailbox', body: 'Once access is granted, the shared mailbox appears in the folder list within an hour. Restart Outlook if it does not.' },
      { title: 'Need access to a mailbox?', body: 'Use the System access request workflow and name the mailbox in the justification.' },
    ],
  },
  {
    slug: 'teams-meetings',
    title: 'Run a smooth Teams meeting',
    category: 'Email & collaboration',
    summary: 'Check your camera, microphone and screen sharing before you join.',
    minutes: 3,
    ticketCategory: 'Software',
    related: ['outlook-signature-shared-mailbox', 'office-wifi'],
    steps: [
      { title: 'Test your devices', body: 'In Teams, open Settings, then Devices, and make a test call to check your microphone and speaker.' },
      { title: 'Pick the right camera', body: 'If your camera is not detected, close other apps that use it and choose it again under Devices.' },
      { title: 'Share one window', body: 'Share a single window instead of your whole screen to avoid showing notifications.' },
      { title: 'Poor connection?', body: 'Turn off incoming video, or move closer to the access point. See the office Wi-Fi guide.' },
    ],
  },
  {
    slug: 'office-wifi',
    title: 'Connect to office Wi-Fi',
    category: 'Connectivity',
    summary: 'Which network to use for staff devices, guests and phones.',
    minutes: 2,
    ticketCategory: 'Network & VPN',
    related: ['vpn-from-home', 'teams-meetings'],
    steps: [
      { title: 'Staff laptops connect automatically', body: 'Company laptops join the staff network on their own. You do not need a password.' },
      { title: 'Phones use the staff mobile network', body: 'Sign in with your work email. Personal phones are fine on this network.' },
      { title: 'Guests use the guest network', body: 'Reception gives visitors a daily code. Guest Wi-Fi cannot reach internal systems.' },
      { title: 'Slow in one room?', body: 'Raise a ticket and name the room. IT can check the access point for that area.' },
    ],
  },
  {
    slug: 'onedrive-sync',
    title: 'Back up your files with OneDrive',
    category: 'Devices & printing',
    summary: 'Keep Desktop and Documents backed up so a lost laptop never means lost work.',
    minutes: 4,
    popular: true,
    ticketCategory: 'Software',
    related: ['shared-drive', 'new-laptop-first-login'],
    steps: [
      { title: 'Check the cloud icon', body: 'A white or blue cloud in the system tray means OneDrive is running and signed in.' },
      { title: 'Turn on folder backup', body: 'Open OneDrive settings, then Sync and back up, then Manage back up. Turn on Desktop, Documents and Pictures.' },
      { title: 'Understand the status icons', body: 'A green tick means the file is on this laptop. A cloud means it is online only and downloads when opened.' },
      { title: 'Restore a deleted file', body: 'Open OneDrive on the web and check the Recycle bin. Files stay there for 90 days.' },
    ],
  },
  {
    slug: 'new-laptop-first-login',
    title: 'First sign-in on a new laptop',
    category: 'Devices & printing',
    summary: 'What to do on day one with a new or replacement laptop.',
    minutes: 6,
    popular: true,
    ticketCategory: 'Hardware',
    related: ['mfa-setup', 'onedrive-sync', 'printer-setup'],
    steps: [
      { title: 'Connect to Wi-Fi or a network cable', body: 'The first sign-in needs a connection to download your settings.' },
      { title: 'Sign in with your work account', body: 'Use the temporary password IT gave you, then set your own passphrase.' },
      { title: 'Set up MFA and Windows Hello', body: 'Follow the prompts to register your authenticator app and a PIN or fingerprint.' },
      { title: 'Let apps install', body: 'Office, Teams and your department apps install by themselves within about 30 minutes. Keep the laptop plugged in.' },
      { title: 'Confirm your files', body: 'Open OneDrive and check your Desktop and Documents have synced from your old laptop.' },
    ],
  },
  {
    slug: 'report-phishing',
    title: 'Spot and report a phishing email',
    category: 'Accounts & security',
    summary: 'Recognise suspicious emails and report them in two clicks.',
    minutes: 3,
    popular: true,
    ticketCategory: 'Other',
    related: ['mfa-setup', 'password-reset'],
    steps: [
      { title: 'Look for the warning signs', body: 'Urgent tone, unexpected attachments, requests for passwords or bank details, and sender addresses that almost match a real one.' },
      { title: 'Do not click or reply', body: 'Hover over links to see where they really go. Never enter your password from an email link.' },
      { title: 'Report it', body: 'Use the "Report" button in Outlook and choose Phishing. This sends it to IT and removes it from your inbox.' },
      { title: 'Clicked by mistake?', body: 'Raise a high-priority ticket straight away and reset your password. Acting fast limits the damage.' },
    ],
  },
  {
    slug: 'request-software',
    title: 'Request new software',
    category: 'Requests & policies',
    summary: 'How to get software approved, licensed and installed.',
    minutes: 2,
    ticketCategory: 'Software',
    related: ['new-laptop-first-login', 'shared-drive'],
    steps: [
      { title: 'Check the Company Portal first', body: 'Approved free software can be installed by yourself from the Company Portal app.' },
      { title: 'Raise a ticket for anything else', body: 'Choose the Software category, name the product and explain what you need it for.' },
      { title: 'Licensed products need approval', body: 'Paid software goes to your manager for approval before IT buys a licence.' },
      { title: 'Installation', body: 'IT installs it remotely. You will get a notification when it is ready.' },
    ],
  },
  {
    slug: 'shared-drive',
    title: 'Open your department shared drive',
    category: 'Connectivity',
    summary: 'Find team folders, and what to do when you see "Access denied".',
    minutes: 3,
    ticketCategory: 'Account & access',
    related: ['vpn-from-home', 'onedrive-sync'],
    steps: [
      { title: 'Open File Explorer', body: 'Department drives appear under "This PC" as lettered drives, for example S: for Shared.' },
      { title: 'Working from home?', body: 'Connect to the VPN first. Shared drives are only reachable on the company network.' },
      { title: 'Drive missing?', body: 'Sign out and back in. Drives are mapped when you sign in.' },
      { title: '"Access denied" on a folder', body: 'Folder access is approved by the folder owner. Use the System access request workflow and choose "File share".' },
    ],
  },
]

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug)
