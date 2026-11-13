# Development Workflow
- feature
- model
- schema
- repository
- service
- controller

- route
- test

# while testing
set SAVINGS_ACCOUNT_ID=6af61a33553f2021cbcc7d8a
set GOAL_ID=6af61abd553f2021cbcc7d93
set GOAL_ID=6af61f94553f2021cbcc7df4
set CONTRIBUTION_ID=6af6214e553f2021cbcc7e14
set RECURRING_ID=<created in M3>
set NOTIFICATION_ID=<created in M4>
set REPORT_ID=<created in M5>
set PENDING_TX_ID=6af61a33553f2021cbcc7d8a
set TX_ID=6af61a33553f2021cbcc7d8a

set CANCELLED_GOAL_ID=6af6238d553f2021cbcc7e50

# address individual consumers , then add niche specific features
- for companies* 
- research on the gap on current existing tools , look for untouched or unsolved  problem then list all possible features 





set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWYyZmNlOTk5ODVlZjY0YmE0MDA0NGMiLCJlbWFpbCI6InRlc3QxNEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdHVzZXIxNCIsImlhdCI6MTc5NDUxMzM1MCwiZXhwIjoxNzk0NTE0MjUwfQ.M2Yepml5J9tzv0fnWWpeYczorILodx0qNis1wpTvfxw


set TX_ID=6af308a82813fbf0b9716ad2

set INCOME_TX_ID=6af5aaffee805593db46c7ce

echo %TOKEN%
echo %ACCOUNT_ID%
echo %CATEGORY_ID%






const findPending = () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return ReportExport.find({
    $or: [
      { status: 'PENDING' },
      { status: 'PROCESSING', updatedAt: { $lt: fiveMinutesAgo } },
    ],
  }).sort({ exportedAt: 1 });
};