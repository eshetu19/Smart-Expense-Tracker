# Development Workflow
- feature
- model
- schema
- repository
- service
- controller

- route
- test







set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWYyZmNlOTk5ODVlZjY0YmE0MDA0NGMiLCJlbWFpbCI6InRlc3QxNEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIxNCIsImlhdCI6MTc5NDMxODg3NSwiZXhwIjoxNzk0MzE5Nzc1fQ.AH-As8ZnwbqdLK5v3LAvSFmS4qefoaF_KprM7mMF-cQ




echo %TOKEN%
echo %ACCOUNT_ID%
echo %CATEGORY_ID%



curl -X POST http://localhost:5000/api/v1/transactions -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"transactionType\":\"EXPENSE\",\"amountCents\":5000,\"title\":\"Coffee purchase\",\"description\":\"Morning coffee\",\"fromAccount\":\"%ACCOUNT_ID%\",\"categoryId\":\"%CATEGORY_ID%\",\"transactionDate\":\"2026-11-10T08:00:00.000Z\"}"















eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWYyZmNlOTk5ODVlZjY0YmE0MDA0NGMiLCJlbWFpbCI6InRlc3QxNEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIxNCIsImlhdCI6MTc5NDMwOTM2MiwiZXhwIjoxNzk0MzEwMjYyfQ.r2IS-S9elPoGqGcRtCtHAxR8u8NZ4EhJ9TyX7KDYwzM





curl -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test14@example.com\",\"password\":\"TestPass123!\"}"

























































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