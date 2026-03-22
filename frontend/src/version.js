// ─────────────────────────────────────────────────────────────────────────────
// WalletOS — Central App Info
// এই file-এ সব update করো। Settings → About page automatically reflect হবে।
// ─────────────────────────────────────────────────────────────────────────────

// ── Version ──────────────────────────────────────────────────────────────────
// Convention: MAJOR.MINOR.PATCH
//   PATCH → bug fix, small UI tweak       (1.1.0 → 1.1.1)
//   MINOR → নতুন feature যোগ              (1.1.1 → 1.2.0)
//   MAJOR → বড় redesign বা breaking change (1.2.0 → 2.0.0)

export const APP_VERSION = '1.2.0';
export const BUILD_DATE  = 'March 2026';

// ── Changelog ─────────────────────────────────────────────────────────────────
export const CHANGELOG = [
  {
    version: '1.2.0',
    date: 'March 2026',
    commit: 'feat: date grouping, multi-delete, transaction list UI redesign, icon fix',
    changes: [
      'Transaction list — date-wise grouping, daily net amount',
      'Multi-select + bulk delete',
      'TxIcon shared component — emoji ও Lucide দুটোই handle করে',
      'Dashboard ও Transaction page icon fix',
      'React Router v7 future flags warning fix',
      'Vercel + Render production deploy',
    ],
  },
  {
    version: '1.1.0',
    date: 'March 2026',
    commit: 'feat: calculator popup, live balance, amount UI redesign',
    changes: [
      'Calculator popup — amount input click করলে popup খোলে',
      'Live account balance modal-এর ভেতরে real-time দেখায়',
      'Amount input redesign — sign badge, right-aligned number',
      'Calculator bugs fix (double operator, post-= behavior)',
      'Tab-wise accent color সব UI-তে',
    ],
  },
  {
    version: '1.0.0',
    date: 'March 2026',
    commit: 'feat: initial release - icon fix, custom dropdowns, modal redesign',
    changes: [
      'LucideIcon style prop fix — icon color কাজ করে',
      'Category dropdown — icon + search + nested indent',
      'Tags dropdown — search সহ multi-select',
      'Status dropdown — icon সহ Cleared/Uncleared/Reconciled',
      'Payer input field যোগ',
      '"Add Record" + "Another Record" button',
      'Settings → About tab',
    ],
  },
];

// ── Task List ─────────────────────────────────────────────────────────────────
// status: 'done' | 'pending' | 'inprogress'
export const TASKS = [
  { id: 1,  label: 'Transaction list-এ icon দেখানো',           status: 'done'    },
  { id: 2,  label: 'Category dropdown — icon + search UI',      status: 'done'    },
  { id: 3,  label: 'Tags search dropdown',                      status: 'done'    },
  { id: 4,  label: 'Status custom dropdown',                    status: 'done'    },
  { id: 5,  label: 'Tab-wise modal color theming',              status: 'done'    },
  { id: 6,  label: 'Amount UI redesign + sign badge',           status: 'done'    },
  { id: 7,  label: 'Calculator popup (click-to-open)',          status: 'done'    },
  { id: 8,  label: 'Calculator bugs fix',                       status: 'done'    },
  { id: 9,  label: 'Payer field যোগ',                           status: 'done'    },
  { id: 10, label: 'Add Record + Another Record button',        status: 'done'    },
  { id: 11, label: 'LocalStorage preferences persist',          status: 'done'    },
  { id: 12, label: 'Live account balance modal-এ',              status: 'done'    },
  { id: 13, label: 'Settings → About page',                     status: 'done'    },
  { id: 14, label: 'Version system (version.js)',               status: 'done'    },
  { id: 15, label: 'Transaction date grouping + daily total',   status: 'done'    },
  { id: 16, label: 'Multi-select bulk delete',                  status: 'done'    },
  { id: 17, label: 'Vercel + Render production deploy',         status: 'done'    },
  { id: 18, label: 'Dashboard charts উন্নত করা',               status: 'pending' },
  { id: 19, label: 'Debt tracker page improve করা',            status: 'pending' },
  { id: 20, label: 'Export to Excel / PDF',                     status: 'pending' },
  { id: 21, label: 'Budget over-alert notification',            status: 'pending' },
  { id: 22, label: 'Dark/Light theme manual toggle',            status: 'pending' },
  { id: 23, label: 'Search by amount range / date range',       status: 'pending' },
  { id: 24, label: 'Recurring transaction auto-create',         status: 'pending' },
  { id: 25, label: 'Mobile PWA icon update',                    status: 'pending' },
];

// ── Future Features / Roadmap ──────────────────────────────────────────────────
export const FUTURE_FEATURES = [
  { icon: '📱', title: 'Mobile App (PWA)',      desc: 'Browser থেকে "Add to Home Screen" করলেই app-এর মতো কাজ করবে।', steps: ['manifest.json আপডেট করো', 'Service Worker যোগ করো', 'Offline cache setup করো'] },
  { icon: '🖥️', title: 'Desktop App (Electron)', desc: 'Electron দিয়ে Windows/Mac/Linux desktop app বানানো যাবে।',  steps: ['electron install করো', 'main.js entry point বানাও', 'npm run build করে package করো'] },
  { icon: '📊', title: 'Advanced Reports',       desc: 'Monthly/yearly comparison, net worth tracker, PDF export।',    steps: ['/api/stats/advanced endpoint বানাও', 'AreaChart/ComposedChart যোগ করো', 'jsPDF দিয়ে export করো'] },
  { icon: '🔔', title: 'Smart Notifications',    desc: 'Budget limit, debt due date, বড় transaction — email alert।',   steps: ['nodemailer setup করো', 'Cron job-এ alert logic যোগ করো', 'Notification center improve করো'] },
  { icon: '🌐', title: 'Multi-Currency',          desc: 'BDT, USD, EUR — live exchange rate দিয়ে auto convert।',        steps: ['exchangerate-api.com যোগ করো', 'Transaction model-এ currency field', 'Dashboard-এ currency switcher'] },
  { icon: '👥', title: 'Multi-User / Family',     desc: 'একই account-এ পরিবারের সবাই access করতে পারবে।',              steps: ['User model-এ family/group concept', 'Invite system (email link)', 'Permission middleware আপডেট'] },
];

// ── Tech Stack ────────────────────────────────────────────────────────────────
export const TECH_STACK = [
  { label: 'Frontend', value: 'React 18 + Tailwind CSS' },
  { label: 'Backend',  value: 'Node.js + Express'       },
  { label: 'Database', value: 'MongoDB + Mongoose'       },
  { label: 'Auth',     value: 'JWT + bcrypt'             },
  { label: 'Charts',   value: 'Recharts'                 },
  { label: 'Icons',    value: 'Lucide React'             },
  { label: 'Deploy',   value: 'Vercel + Render'          },
];