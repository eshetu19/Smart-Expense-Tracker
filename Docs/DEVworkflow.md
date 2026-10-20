# Development Workflow
- feature
- model
- schema
- repository
- service
- controller
- route
- test




repositories/
├── user.repository.js
├── userSettings.repository.js
├── token.repository.js         (handles all 3 token types — refresh, reset, verify)
├── account.repository.js
├── category.repository.js
├── tag.repository.js
├── transaction.repository.js
├── transactionTag.repository.js
├── transactionAttachment.repository.js
├── budget.repository.js
├── savingsGoal.repository.js
├── savingsContribution.repository.js
├── recurringTransaction.repository.js
├── notification.repository.js
└── reportExport.repository.js









config/                   ← DONE (env, db, constants)
utils/                    ← PARTIAL (ApiError, ApiResponse, asyncHandler)
middlewares/              ← PARTIAL (error middleware only)
models/ (18)              ← DONE
repositories/ (15)        ← DONE ← THIS WAS THE LAST MESSAGE
services/                 ← NOT STARTED
validations/              ← NOT STARTED
controllers/              ← NOT STARTED
routes/                   ← NOT STARTED
app.js / server.js        ← NOT STARTED
jobs/                     ← NOT STARTED
scripts/seed.js           ← NOT STARTED





const findPending = () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return ReportExport.find({
    $or: [
      { status: 'PENDING' },
      { status: 'PROCESSING', updatedAt: { $lt: fiveMinutesAgo } },
    ],
  }).sort({ exportedAt: 1 });
};