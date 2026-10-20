1. What problem am I solving 
. Most of the time peoples think making more money is the solution to be financially free even though they are right but if you can’t manage the money you make and not use it properly still being financially smart and free is not possible so I built this platform to help users manage their many smart way .  to manage your many you have to know how to spend it and you have to track where you most spent it so to manage your many you have to manage your expenses you have to know on which events, products and services you spend your many that helps you to identify which spending is taking your money which one saves it and also to decide to keep spending on it or cut the spending . in general  the application help you to record and manage  all your spending , seeing spending by categories, getting analytics on spending  , you can set goals for saving , you will get smart financial suggestions , investment recommendations based on your data , you can set spending limit and see which category meets the spending limits and exceeds . in general with this application you can control your spending , saving, expenses all in one 
2.	Who will use this product 
. anybody  who has money and want to manage  can use this application .  Males  , Females ,  young, adults  can use it . if you suffer from controlling your money ,if you think like I make a lots of money but I don’t know where it goes  this application is for you. 
3.	What should the application accomplish 
. the user accomplishes the following activities with the application
   . add their expenses
   . set saving goals 
   . track their goals
   . manage their expenses by category
   . filter expenses by category 
   . track their transaction from banks or others
   . see their spending analytics 
   . get notification  of spending limit reached or exceeded
4.	What are the limitations
    . there is some financial limitations 
        . hosting fee
        . getting  bank transaction information is hard if it needs fee for their API
        . for AI subscriptions and other cloud subscriptions
    . technical  limitations
        . integrating AI for smart analysis and suggestion requires me to take course or read some articles
        . implementing notification service  needs some learning
        . changing to mobile application needs learning time
     
        
 
Feature Planning
. The Main Modules
1.	Authentication
2.	User profile
3.	Accounts 
4.	Categories
5.	Transactions
6.	Budgets
7.	Saving goals
8.	Analytics
9.	Notifications
10.	Reports
11.	Settings
12.	Smart features
. Features for each module
1.	Authentication
. purpose : control who can access the application
=>	Features
-	User registration
-	User login
-	User logout
-	Refresh JWT token
-	Forgot password
-	Reset password
-	Change password
-	Email verification
-	Resend verification email
-	Account deactivation
2.	User Profile
. Purpose  : manage personal Information
=>	Features
-	View profile
-	Update profile
-	Upload profile picture
-	Change preferred currency
-	Set time zone
-	Set language
3.	Accounts
. Purpose : track where money is stored cash, bank account , mobile wallet , credit card
=>	Features 
-	Create account 
-	Edit account
-	Delete account
-	View account balance
-	Transfer many between accounts


4.	Categories
. purpose : organize transactions
=>	Features 
-	Create category 
-	Edit category
-	Delete category
-	Default categories
-	Custom categories
-	Category icon
-	Category color
5.	    Transactions
. purpose : it is a core module
=>	Features 
-	Add income 
-	Add expense
-	Edit transaction
-	Delete transaction
-	View transaction details
-	Search transactions
-	Filter by category
-	Filter by account
-	Filter by date
-	Sort transactions
-	Upload receipt image
-	Add notes
-	Mark recurring transaction
6.	Budgets
=>	Features 
-	Create monthly budget
-	Create weekly budget
-	Category budget
-	Delete budget
-	Budget progress
-	Budget alerts
7.	Saving goals 
=>	Features 
-	Create saving goals
-	Update progress
-	Delete goal 
-	View progress
-	Goal deadline
-	Goal completion notification
8.	Analytics 
=>	Features 
-	Total income 
-	Total expenses
-	Current balance
-	Spending by category
-	Monthly report
-	Weekly report
-	Daily report
-	Income vs expense
-	Expense trends
-	Top spending categories
9.	Notifications 
=>	Features 
-	Budget exceeded
-	Goal achieved
-	Upcoming bills
-	Reminder to add todays expenses
-	Monthly summary notification
10.	Reports 
=>	Features 
-	Export PDF
-	Export CSV
-	Export Excel
-	Print report
-	Monthly report
-	Annual report
11.	    Settings 
=>	Features 
-	Dark mode
-	Light mode
-	Change password
-	Manage notification preference 
-	Backup data
-	Restore data
-	Privacy policy 
12.	Smart features
=>	Features 
-	Predict monthly spending
-	Detect unusual spending
-	Personalized saving tips
-	Recommend budget amounts
-	Detect recurring expenses
-	Financial health score     

    


    

    

    

             Database design 
Total tables
1.	Users 
2.	Refresh tokens
3.	Accounts
4.	Categories
5.	Transactions
6.	Transaction attachments
7.	Recurring transaction
8.	Budgets
9.	Budget alerts
10. saving goals
11. savings contribution
12. notifications
13. report exports
14. user settings
    

 
                    Users Table
. The users table stores the identity and profile information of every registered user 
. Business rule one user can own many accounts categories transactions budgets saving goals notifications and reports 
Columns
-	Id                                        BIDINT UNSIGNED
-	First name                         VARCHAR(100)
-	Last name                           VARCHAR(100)
-	Username                           VARCHAR(50)
-	Email                                     VARCHAR(255)
-	Password hash                     VARCHAR(255)
-	Phone number                     VARCHAR(20)
-	Profile image                         VARCHAR(255)
-	Preferred currency                CHAR(3)
-	Time zone                                VARCHAR(100)
-	Language                                 VARCHAR(10)
-	Email verified                          BOOLEAN
-	Is active                                    BOOLEAN
-	Last login at                             DATETIME
-	Created at                                TIMESTAMP
-	Updated at                               TIMESTAMP

 
Refresh tokens table
. when a user logs in they receive an access token and refreshed token the refresh token allows the user to obtain a new access  token without logging in again 
. revoke a single device
. logout from one or all devices
. detect expired tokens
. improve security
Columns
-	Id                                   BIGINT UNSIGNED
-	User id                          BIGINT UNSIGNED
-	Token hash                  VARCHAR(255)
-	Device name                VARCHAR(100)
-	IP address                     VARCHAR(45) 
-	User agent                    VARCHAR(255)
-	Expires at                       DATETIME
-	Revoked at                   DATETIME NULL
-	Created at                     TIMESTAMP


 
       Accounts table  
  An account is where money stored 
Columns
-	Id                                             BIGINT UNSIGNED
-	User id                                    BIGINT UNSIGNED
-	Name                                      VARCHAR(100)
-	Account type                         VARCHAR(30)
-	Account number                   VARCHAR(50) NULL
-	Institution name                   VARCHAR(100) NULL
-	Opening balance                   DECIMAL(15,2)
-	Current balance                    DECIMAL(15,2)
-	Currency                                 CHAR(3)
-	Color                                        VARCHAR(20)
-	Icon                                          VARCHAR(100)
-	Is default                                 BOOLEAN
-	Is active                                  BOOLEAN
-	Created at                              TIMESTAMP
-	Updated at                             TIMESTAMP                           
                                              
Categories table
Columns
-	Id                                 BIGINT UNSIGNED
-	User id                        BIGINT UNSIGNED NULL
-	Name                          VARCHAR(100)
-	Type                            VARCHAR(20)
-	Icon                             VARCHAR(100)
-	Color                           VARCHAR(20)
-	Description                VARCHAR(255) NULL
-	Is system                    BOOLEAN
-	Is active                      BOOLEAN
-	Created at                  TIMESTAMP
-	Updated at                  TIMESTAMP     
 
Transactions table
columns  
-	Id                                                       BIGINT UNSIGNED
-	User id                                              BIGINT UNSIGNED
-	From account id                              BIGINT UNSIGNED
-	To account id                                   BIGINT UNSIGNED
-	Category id                                       BIGINT UNSIGNED
-	Amount                                             DECIMAL(15,2)
-	Transaction type                              VARCHAR(20)
-	Title                                                     VARCHAR(150)
-	Description                                        TEXT
-	Transaction date                               DATETIME
-	Reference number                            VARCHAR(100) NULL
-	Location                                               VARCHAR(255) NULL
-	Payment method                                VARCHAR(50)
-	Status                                                    VARCHAR(30)
-	Created at                                             TIMESTAMP
-	Updated at                                             TIMESTAMP     

 
         Tags Table
Allows users to organize transactions with flexible labels
Features supported 
.  create tag
. edit tag
. delete tag
. assign multiple tags
. search by tags
. filter by tag
. analytics by tag
. export by tag
Columns
-	Id                             BIGINT UNSIGNED
-	User id                    BIGINT UNSIGNED
-	Name                      VARCHAR(50)
-	Color                        VARCHAR(20)
-	Description             VARCHAR(255) NULL
-	Created at               TIMESTAMP
-	Updated at              TIMESTAMP

 
         Transaction Tags table
Used to connect transactions and tags
Columns
-	Transaction id               	BIGINT UNSIGNED
-	Tag id                                      BIGINT UNSIGNED
-	Created at                              TIMESTAMP
                         Budgets Table
Stores spending limits for user overall budget and specific category
Features supported
-	Create budget
-	Edit budget
-	Delete budget
-	Monthly budget
-	Weekly budget
-	Yearly budget
-	Category budget
-	Budget progress
-	Budget alerts
-	Dashboard budget summary
 
Columns
-	Id                                        BIGINT UNSIGNED
-	User id                               BIGINT UNSIGNED
-	Category id                        BIGINT UNSIGNED NULL
-	Name                                  VARCHAR(100)
-	Amount                               DECIMAL(15,2)
-	Period                                  VARCHAR(20)
-	Start date                             DATE 
-	End date                                DATE
-	Alert percentage                  TINYINT
-	Is active                                 BOOLEAN
-	Created at                             TIMESTAMP
-	Updated at                            TIMESTAMP

                 Saving  goals
Feature supported
-	Create savings goal
-	Edit goal
-	Delete goal
-	Track progress
-	Goal completion
-	Goal analytics
-	Goal reminders
-	Dashboard progress
Columns
-	Id
-	User id
-	Account id
-	Title 
-	description
-	target amount
-	target date
-	color
-	icon
-	priority
-	status
-	created at
-	updated at
savings contribution table
links a financial transaction to a savings goal
Columns
-	id
-	savings goal id
-	transaction id
-	note
-	created at

 
     Notifications Table
Needs to inform users about important event
Example
-	budget reached 80%
-	budget exceeded
-	savings goal completed
-	recurring transaction created
-	password changed
-	email verified
-	welcome message
-	monthly financial report ready
features supported
-	notification center
-	mark as read
-	mark all as read
-	delete notification
-	notification history
-	push notifications
-	email notifications
Columns
-	id
-	user id
-	title
-	message
-	notification type
-	priority
-	is read
-	read at
-	reference type
-	reference id
-	created at
transaction attachments table
users may attach files to transaction
-	 receipt photo
-	Invoice PDF
-	Warranty document
-	Bank statement
Features supported
-	Upload receipt
-	Delete receipt
-	View receipt
-	Download attachment
Columns
-	Id
-	Transaction id
-	File name
-	Stored file name
-	File path
-	File type
-	File size
-	Upload at
     
   Recurring transactions
Columns
-	Id
-	User id
-	Category id
-	From account id
-	To account id
-	Transaction type
-	Amount
-	Title
-	Description
-	Payment method
-	Frequency
-	Interval value
-	Start date
-	End date
-	Next run at
-	Last run at
-	Is active
-	Created at
-	Updated at
        Report exports table
Columns
-	Id
-	User id
-	Report name
-	Report type
-	Export format
-	Start date
-	End date
-	File path
-	File size
-	Status
-	Generated at
-	Expires at
    User settings table
Store all configurable user preferences
Columns
-	Id
-	User id
-	Preferred currency
-	Language
-	Time zone
-	Date format
-	Time format
-	Theme
-	Default account id
-	Default export format
-	Notification enabled
-	Email notifications
-	Push notifications
-	First day of week
-	Created at
-	Updated at


