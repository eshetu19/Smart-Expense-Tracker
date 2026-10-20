Fullstack-Expense-Tracker-App/
│
├── server/
│ │
│ ├── src/
│ │ │
│ │ ├── config/
│ │ │ ├── index.js # Loads & validates env vars
│ │ │ ├── database.js # Mongoose connection setup
│ │ │ └── constants.js # Global app constants
│ │ │
│ │ ├── models/ # Mongoose schemas (M)
│ │ │ ├── index.js
│ │ │ ├── User.js
│ │ │ ├── UserSettings.js
│ │ │ ├── Account.js
│ │ │ ├── Category.js
│ │ │ ├── Tag.js
│ │ │ ├── Transaction.js
│ │ │ ├── TransactionAttachment.js
│ │ │ ├── Budget.js
│ │ │ ├── SavingsGoal.js
│ │ │ ├── RecurringTransaction.js
│ │ │ ├── Notification.js
│ │ │ ├── RefreshToken.js
│ │ │ ├── PasswordResetToken.js
│ │ │ └── EmailVerificationToken.js
│ │ │
│ │ ├── validations/ # Request validation schemas (Zod/Joi)
│ │ │ ├── index.js
│ │ │ ├── auth.validation.js
│ │ │ ├── user.validation.js
│ │ │ ├── account.validation.js
│ │ │ ├── category.validation.js
│ │ │ ├── tag.validation.js
│ │ │ ├── transaction.validation.js
│ │ │ ├── budget.validation.js
│ │ │ ├── savingsGoal.validation.js
│ │ │ ├── recurringTransaction.validation.js
│ │ │ └── notification.validation.js
│ │ │
│ │ ├── repositories/ # Data-access layer (DB queries only)
│ │ │ ├── index.js
│ │ │ ├── user.repository.js
│ │ │ ├── userSettings.repository.js
│ │ │ ├── account.repository.js
│ │ │ ├── category.repository.js
│ │ │ ├── tag.repository.js
│ │ │ ├── transaction.repository.js.....
│ │ │ ├── transactionAttachment.repository.js
│ │ │ ├── budget.repository.js
│ │ │ ├── savingsGoal.repository.js
│ │ │ ├── recurringTransaction.repository.js
│ │ │ ├── notification.repository.js
│ │ │ └── token.repository.js # refresh / reset / verify tokens
│ │ │
│ │ ├── services/ # Business logic layer
│ │ │ ├── index.js
│ │ │ ├── auth.service.js
│ │ │ ├── user.service.js
│ │ │ ├── account.service.js
│ │ │ ├── category.service.js
│ │ │ ├── tag.service.js
│ │ │ ├── transaction.service.js
│ │ │ ├── budget.service.js
│ │ │ ├── savingsGoal.service.js
│ │ │ ├── recurringTransaction.service.js
│ │ │ ├── notification.service.js
│ │ │ ├── email.service.js
│ │ │ └── file.service.js
│ │ │
│ │ ├── controllers/ # HTTP request handlers (C)
│ │ │ ├── index.js
│ │ │ ├── auth.controller.js
│ │ │ ├── user.controller.js
│ │ │ ├── account.controller.js
│ │ │ ├── category.controller.js
│ │ │ ├── tag.controller.js
│ │ │ ├── transaction.controller.js
│ │ │ ├── budget.controller.js
│ │ │ ├── savingsGoal.controller.js
│ │ │ ├── recurringTransaction.controller.js
│ │ │ ├── notification.controller.js
│ │ │ └── report.controller.js
│ │ │
│ │ ├── routes/ # Express routers
│ │ │ ├── index.js # Mounts all sub-routers
│ │ │ ├── auth.routes.js
│ │ │ ├── user.routes.js
│ │ │ ├── account.routes.js
│ │ │ ├── category.routes.js
│ │ │ ├── tag.routes.js
│ │ │ ├── transaction.routes.js
│ │ │ ├── budget.routes.js
│ │ │ ├── savingsGoal.routes.js
│ │ │ ├── recurringTransaction.routes.js
│ │ │ ├── notification.routes.js
│ │ │ └── report.routes.js
│ │ │
│ │ ├── middlewares/
│ │ │ ├── index.js
│ │ │ ├── auth.middleware.js # JWT verification
│ │ │ ├── role.middleware.js # Role-based access
│ │ │ ├── validate.middleware.js # Runs validation schemas
│ │ │ ├── upload.middleware.js # Multer for attachments
│ │ │ ├── rateLimiter.middleware.js
│ │ │ ├── notFound.middleware.js
│ │ │ └── error.middleware.js # Global error handler
│ │ │
│ │ ├── utils/
│ │ │ ├── index.js
│ │ │ ├── ApiError.js # Custom error class
│ │ │ ├── ApiResponse.js # Standard response wrapper
│ │ │ ├── asyncHandler.js # Async try/catch wrapper
│ │ │ ├── jwt.js # Sign / verify tokens
│ │ │ ├── password.js # Hash / compare
│ │ │ ├── email.js # Email dispatcher
│ │ │ ├── upload.js # File handling helpers
│ │ │ ├── pagination.js # Pagination helper
│ │ │ ├── logger.js # Winston logger
│ │ │ └── helpers.js
│ │ │
│ │ ├── constants/ # App-wide enums
│ │ │ ├── index.js
│ │ │ ├── roles.js
│ │ │ ├── accountTypes.js
│ │ │ ├── transactionTypes.js
│ │ │ ├── notificationTypes.js
│ │ │ └── settings.js
│ │ │
│ │ ├── jobs/ # Scheduled / cron tasks
│ │ │ ├── index.js
│ │ │ ├── recurringTransaction.job.js
│ │ │ ├── budgetAlert.job.js
│ │ │ └── monthlyReport.job.js
│ │ │
│ │ ├── templates/
│ │ │ └── emails/
│ │ │ ├── verifyEmail.html
│ │ │ ├── resetPassword.html
│ │ │ ├── welcome.html
│ │ │ └── budgetAlert.html
│ │ │
│ │ ├── app.js # Express app setup
│ │ └── server.js # Entry point (DB + listen)
│ │
│ ├── uploads/ # Local file storage (gitignored)
│ │ ├── profile_pictures/
│ │ └── transaction_attachments/
│ │
│ ├── scripts/
│ │ ├── seed.js # Seed default data
│ │ └── migrateFromSql.js # Import MySQL data → MongoDB
│ │
│ ├── tests/
│ │ ├── unit/
│ │ ├── integration/
│ │ └── setup.js
│ │
│ ├── logs/
│ │ ├── error.log
│ │ └── combined.log
│ │
│ ├── .env
│ ├── .env.example
│ ├── .eslintrc.json
│ ├── .prettierrc
│ ├── .gitignore
│ ├── package.json
│ ├── package-lock.json
│ └── README.md
│
├── frontend/
│
├── docs/
│ ├── api.md
│ └── database.md
│
├── .gitignore
├── LICENSE
└── README.md





















Fullstack-Expense-Tracker-App/
│
├── frontend/
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── robots.txt
│   │
│   ├── src/
│   │   │
│   │   ├── api/                          # Axios + all API calls
│   │   │   ├── axiosClient.js            # Base axios instance + interceptors
│   │   │   ├── auth.api.js
│   │   │   ├── user.api.js
│   │   │   ├── account.api.js
│   │   │   ├── category.api.js
│   │   │   ├── tag.api.js
│   │   │   ├── transaction.api.js
│   │   │   ├── budget.api.js
│   │   │   ├── savingsGoal.api.js
│   │   │   ├── recurringTransaction.api.js
│   │   │   ├── notification.api.js
│   │   │   └── report.api.js
│   │   │
│   │   ├── assets/                       # Images, fonts, icons
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/                   # Reusable UI
│   │   │   ├── common/                   # Button, Input, Modal, Loader, etc.
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   │
│   │   │   ├── layout/                   # App shell
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   │
│   │   │   ├── auth/                     # Auth-specific pieces
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── ForgotPasswordForm.jsx
│   │   │   │   └── ResetPasswordForm.jsx
│   │   │   │
│   │   │   ├── dashboard/                # Dashboard widgets
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── RecentTransactions.jsx
│   │   │   │   ├── BudgetProgressWidget.jsx
│   │   │   │   └── SavingsGoalWidget.jsx
│   │   │   │
│   │   │   ├── transaction/              # Transaction UI
│   │   │   │   ├── TransactionCard.jsx
│   │   │   │   ├── TransactionForm.jsx
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   ├── TransactionFilters.jsx
│   │   │   │   └── AttachmentUpload.jsx
│   │   │   │
│   │   │   ├── category/
│   │   │   │   ├── CategoryCard.jsx
│   │   │   │   ├── CategoryForm.jsx
│   │   │   │   └── CategoryList.jsx
│   │   │   │
│   │   │   ├── tag/
│   │   │   │   ├── TagInput.jsx
│   │   │   │   └── TagBadge.jsx
│   │   │   │
│   │   │   ├── account/
│   │   │   │   ├── AccountCard.jsx
│   │   │   │   ├── AccountForm.jsx
│   │   │   │   └── AccountList.jsx
│   │   │   │
│   │   │   ├── budget/
│   │   │   │   ├── BudgetCard.jsx
│   │   │   │   ├── BudgetForm.jsx
│   │   │   │   ├── BudgetList.jsx
│   │   │   │   └── BudgetProgress.jsx
│   │   │   │
│   │   │   ├── savingsGoal/
│   │   │   │   ├── SavingsGoalCard.jsx
│   │   │   │   ├── SavingsGoalForm.jsx
│   │   │   │   └── SavingsGoalList.jsx
│   │   │   │
│   │   │   ├── recurring/
│   │   │   │   ├── RecurringCard.jsx
│   │   │   │   ├── RecurringForm.jsx
│   │   │   │   └── RecurringList.jsx
│   │   │   │
│   │   │   ├── notification/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── NotificationDropdown.jsx
│   │   │   │   └── NotificationItem.jsx
│   │   │   │
│   │   │   ├── charts/                   # Recharts / Chart.js wrappers
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   └── CategoryBreakdownChart.jsx
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── MonthlySummary.jsx
│   │   │       ├── CategoryReport.jsx
│   │   │       └── DateRangePicker.jsx
│   │   │
│   │   ├── context/                      # Global state (Context API)
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── hooks/                        # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTheme.js
│   │   │   ├── useTransactions.js
│   │   │   ├── useBudgets.js
│   │   │   ├── useCategories.js
│   │   │   ├── useDebounce.js
│   │   │   ├── usePagination.js
│   │   │   └── useFetch.js
│   │   │
│   │   ├── pages/                        # Route-level pages
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── TransactionDetails.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Tags.jsx
│   │   │   ├── Accounts.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── SavingsGoals.jsx
│   │   │   ├── RecurringTransactions.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── ServerError.jsx
│   │   │
│   │   ├── routes/                       # Routing config + guards
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx        # Requires auth
│   │   │   ├── PublicRoute.jsx           # Redirects if logged in
│   │   │   └── RoleRoute.jsx             # Requires specific role
│   │   │
│   │   ├── services/                     # Client-side business logic
│   │   │   ├── auth.service.js           # login/logout/refresh
│   │   │   ├── storage.service.js        # localStorage helpers
│   │   │   └── export.service.js         # CSV / PDF export
│   │   │
│   │   ├── store/                        # (optional) Zustand / Redux
│   │   │   ├── authStore.js
│   │   │   ├── transactionStore.js
│   │   │   └── uiStore.js
│   │   │
│   │   ├── utils/                        # Pure helpers
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   ├── chartColors.js
│   │   │   └── errorMessages.js
│   │   │
│   │   ├── styles/                       # Tailwind config + globals
│   │   │   ├── index.css
│   │   │   └── tailwind.css
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── .gitignore
│   ├── index.html
│   ├── jsconfig.json                     # for @/ path alias
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── docs/
├── .gitignore
├── LICENSE
└── README.md