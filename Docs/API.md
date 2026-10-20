## modules
- Authentication API
- User API
- Accounts API
- Categories API
- Tags API
- Transactions API
- Transaction Attachment API
- Budgets API
- Savings Goals API
- Recurring Transactions API
- Notifications API
- Reports API
                 Authentication API Design
# it is responsible for 
- registering usrs
- logging users in
- Issuing JWT access tokens
- issuing refresh tokens
- refreshing expired access tokens
- logging out
- logging out from all devices
- changing passwords
- resetting forgotten passwords
- veryfying the current user's identity
# Authentication flow
--------------------------------------------------------------------
 - user registers
 - password is hashed with bcyrpt
 - User stored in database
--------------------------------------------------------------------
- User logs in
- verify email
- verify password
--------------------------------------------------------------------
- generate jwt access tokens
- generate refresh token
- hash refresh token
- store hash in refresh_tokens
- return tokens
--------------------------------------------------------------------
- Every protected request
- Autherization : bearer <access_token>
- JWT verification
- Allow Access
--------------------------------------------------------------------
- Access token expires
- POST/auth/refresh
- verify refresh token
- issue new access token
# Authentication End Points
Method               Endpoint                   Purpose 
POST           /api/v1/auth/rgister           register new user
POST          /api/v1/auth/login              for login
POST         /api/v1/auth/refresh             get new access token
POST        /api/v1/auth/logout               logout current device
POST       /api/v1/auth/logout-all            logout all devices
GET       /api/v1/auth/me                     get current user
PATCH    /api/v1/auth/change-password         change password
POST    /api/v1/auth/forgot-password    request password reset 
POST   /api/v1/auth/reset-password      reset password
POST  /api/v1/auth/verify-email         verify email adress
POST   /api/v1/auth/resend-verification-email

                 1. register endpoint
creates a new user account after successful registration the user can login to access the application. no authentication is required anyone should be able to create account.

# request body
- first_name
- last_name
- user_name
- email
- password
- confirm_password

# validation rules
- first_name 
    . required
    . 2 - 50 characters
    . letters only
- last_name 
    . required
    . 2 - 50 characters
- username
    . required
    . unique
    . 3 - 30 characters
    . only numbers letters numbers and underscores
- email 
    . required
    . valid email format
    . must be unique
    . convert to lowercase before storing
- password
    . required
    . minimum 12 characters 
    . at least
       - one uppercase letter
       - one lowercase letter
       - one number
       - one special character
# success response
- status code :201 created
  {
    "message":"user registered successfully,
    "user":{
        "id":1,
        "first_name":"name",
        "last_name":"lname",
        "username":"uname",
        "email":"email123@gmail.com"
    }
  }
# Error responses
- status code : 400 bad request
 {
   "message":"validation failed", 
   "errors":{
    "email":[
        "Email is invalid
    ]
   }
 }
- duplicate email 
- status code : 409 conflict
{
    "message":"Email already exists"
}
- duplicate username 
- status code : 409 conflict
{
    "message": "username not avaliable"
}
- server error
- status code : internal server error
{
    "message": "something went wrong . please try again"
}
# backend workflow
recieve request -> validate request data -> check email exists -> check username exists -> hash password(bcrypt) -> create user -> create default user settings -> commit transactions -> return 201 created
  
                    2. login endpoint
Authenticate user and issue an access token and a refresh token
- we use login with email or username both are stored in our database table
# success response
status code : 200 ok
{
    "message":"login successful.",
    "access_token":"<JWT_ACCESS_TOKEN>",
    "refresh_token":"<JWT_REFRESH_TOKEN>",
    "expires_in":900,
    "token_type":"Bearer",
    "user":{
        "id':1,
        "first_name":"eshetu",
        "last_name":"Tsegaye",
        "username":"eshe_dev",
        "email":"email123@gmail.com"
    }

}
# error responses

- invalid credentials
status code : 401 unauthorized
{
    "message":"invalid email/username/password."
}
- validation error
status code : 400 bad request
{
    "message" : "validation failed"
    "errors":{
        "password/email/username":[
            "password/email/username is required"
        ]
    }
}

# backend workflow
Recieve request -> validate input -> find user by email or username
-> user exists? -> verify password(bcrypt) -> generate access token 
-> generate refresh token -> hash refresh token -> save refresh token -> return tokens 

                     3. refresh endpoint
- issue a new access token where the current one expires without requiring the user to login again
# request body
{
    "refresh_token" : "<JWT_REFRESH_TOKEN>"
}

# backend workflow
recieve refresh_token -> verify JWT Signature -> is token expired? -> find  token hash in the database -> is token revoked? -> load user -> generate new access token ->rotate refresh token -> return new tokens

# success response
status code : 200 ok
{
    "access_token" :"<NEW_ACCESS_TOKEN>",
    "refresh_token":"<NEW_REFRESH_TOKEN>,
    "expires_in":900,
    "token_type":"Bearer"
}
# Error response
- invalid refresh token
status code : 401 unauthorized
{
    "message":"invalid refresh token"
}
- expired refresh token
status code : 401 unauthorized
{
    "message":"refresh token has expired"
}
- revoked refresh token
status code : 401 unauthorized
{
    "message":"refresh token has been revoked"
}

                   4. logout endpoint
- logs the user out from thr current device only by revoking the current refresh token. authentication is required the user must be authenticated with a valid access token addititonally the request must include the refresh token of the session being logged out

# Request
- headers 
Authorization : Bearer<ACCESS_TOKEN>
- body
{
    "message":"<JWT_REFRESH_TOKEN>"
}
# Backend workflow
recieve request -> validate access token -> extract user id -> verify refresh token -> find refresh token in database -> mark token as revoked -> commit changes -> return success

# Business Logic
. after logout
-  current device cannot refresh its access token anymore
- other devices remain logged in
- existing access token may still work until it expires 
- after expiration the user must login again on that device


                     5. logout all endpoint
- Logs the user out from every device by revoking all active refresh tokens belonging to that user . the authentication is required the user must send a valid access token no request body is required 
# request 
- headers
Authorization : Bearer<ACCESS_TOKEN>
# business rules
- requires authentication
- revokes every active refresh token for the authenticated user
- does not affect the other users
- existing access tokens remain valid until they expire after that every device must login again

                6. get current user (/me) endpoint
returns profile of the currently authenticatd user . the authentication is required the user must provide a valid access token . has no request body .
# Request
- headers
Authorization : Bearer<ACCESS_TOKEN>
- response should return complete user profile
{
    "user":{
        "id" :1,
        "first_name" :"eshetu",
        "last_name" : "tsegaye",
        "username" : "eshetu_dev",
        "email" :"email123@gamil.com",
        "profile_picture" : null
    }
    "settings":{
        "currency" :"ETB",
        "language" : "en",
        "timezone" : "east african timezone",
        "theme" : "system"
    }
}

                  7. change-password endpoint
- Allows an authenticated users to change their password after verifying their current password . this end point is used when the user knows their current password if they forgot their password they will use the forgot password flow instead. a valid access token is required

# Request 
- headers
Authorization : Bearer<ACCESS_TOKEN>
-body
{
    "current_password" : "oldpassword123",
    "new_password" : "nextpassword",
    "confirm_password" : "repeatit"
}
# success response
status code : 200 ok
{
    "message" : "password changed successfully. please login again to continue"
}

# Error Responses
- Incorrect Current Password
status code : 401 Unauthorized
{
    "message": "Current password is incorrect."
}

- Validation Error
status code : 400 Bad Request
{
    "message": "Validation failed.",
    "errors": {
        "new_password": [
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        ]
    }
}
- New Password Matches Current Password
status code : 400 Bad Request
{
    "message": "New password must be different from the current password."
}

                8. Forgot Password endpoint
- Allows a user who has forgotten their password to request a password reset.

The endpoint does not reset the password. It only starts the recovery process by generating a secure reset token and sending it to the user's email.
 # Request Body
 {
    "email": "eshetu@example.com"
}

# Validation Rules
   - email
   - Required
   - Valid email format
   - Convert to lowercase before lookup
# Backend Workflow
Receive Request
        ↓
Validate Email
        ↓
Find User by Email
        ↓
If User Exists
        ↓
Generate Secure Reset Token
        ↓
Hash Reset Token
        ↓
Store Hashed Token + Expiration Time
        ↓
Send Password Reset Email
        ↓
Return Generic Success Message

# Success Response

 Status Code : 200 OK

{
    "message": "If an account with that email exists, a password reset link has been sent."
}

# Error Responses

- Validation Error
 status code : 400 Bad Request
{
    "message": "Validation failed.",
    "errors": {
        "email": [
            "A valid email address is required."
        ]
    }
}
- Rate Limit Exceeded
 staus code : 429 Too Many Requests
{
    "message": "Too many password reset requests. Please try again later."
}
               9. Reset Password endpoint
- Allows a user to set a new password using a valid password reset token received via email.

# Request Body

{
    "reset_token": "<PASSWORD_RESET_TOKEN>",
    "new_password": "NewStrongPassword123!",
    "confirm_password": "NewStrongPassword123!"
}

# Validation Rules
- reset_token
  Required
  Must be valid
  Must not be expired
  Must not have been used before
- new_password
  Required
  Minimum 8 characters
  At least:
     One uppercase letter
     One lowercase letter
     One number
     One special character
- confirm_password
  Required
  Must match new_password

# Backend Workflow

Receive Request
        ↓
Validate Request
        ↓
Hash Reset Token
        ↓
Find Matching Token
        ↓
Token Exists?
        ↓
Token Expired?
        ↓
Token Already Used?
        ↓
Load User
        ↓
Hash New Password
        ↓
Update User Password
        ↓
Mark Reset Token as Used
        ↓
Revoke All Refresh Tokens
        ↓
Commit Transaction
        ↓
Return Success

# Success Response

Status Code : 200 OK

{
    "message": "Password has been reset successfully. Please log in with your new password."
}
# Error Responses
- Invalid Token
status code : 400 Bad Request
{
    "message": "Invalid password reset token."
}
- Expired Token
status code : 400 Bad Request
{
    "message": "Password reset token has expired."
}
- Token Already Used
status code : 400 Bad Request
{
    "message": "Password reset token has already been used."
}
- Validation Error
status code : 400 Bad Request
{
    "message": "Validation failed.",
    "errors": {
        "confirm_password": [
            "Passwords do not match."
        ]
    }
}

                10. Verify Email endpoint
- Verifies that the email address belongs to the user.

When a user registers, they receive a verification email containing a secure verification link.

# Request Body

{
    "verification_token": "<EMAIL_VERIFICATION_TOKEN>"
}

# Validation Rules
- verification_token
  . Required
  . Must be valid
  . Must not be expired
  . Must not have been used before
# Backend Workflow
Receive Request
        ↓
Validate Request
        ↓
Hash Verification Token
        ↓
Find Matching Token
        ↓
Token Exists?
        ↓
Token Expired?
        ↓
Token Already Used?
        ↓
Load User
        ↓
Mark User as Verified
        ↓
Set email_verified_at
        ↓
Mark Verification Token as Used
        ↓
Commit Transaction
        ↓
Return Success

# Success Response
Status Code : 200 OK

{
    "message": "Email verified successfully. You can now log in."
}
# Error Responses
- Invalid Token
status code : 400 Bad Request
{
    "message": "Invalid email verification token."
}
- Expired Token
status code : 400 Bad Request
{
    "message": "Email verification token has expired."
}
- Token Already Used
status code  : 400 Bad Request
{
    "message": "Email has already been verified."
}


#  Users API Endpoints
Method              Endpoint
GET               /api/v1/users/profile
PATCH            /api/v1/users/profile
PATCH           /api/v1/users/profile-picture
GET            /api/v1/users/settings
PATCH         /api/v1/users/settings
DELETE       /api/v1/users/account        
                  1. Get profile endpoint
returns the authenticted user's profile information. a valid access token is required does not have a request body
# Request
- headers 
  Authorization : Bearer<ACCESS_TOKEN>
# Backend workflow
Recive request -> validate access token -> extract usr id -> fetch user -> return profile

                  2. Update user profile Endpoint
Allows an authenticated user to update their personal profile information . a valid access token is required 
# Request 
- headers 
 Authorization : Bearer<ACCESS_TOKEN>
- Body
 users send only the fields they want to update

# updateable fields 
   - first_name
   - last_name
   - username
   - email
# user cannot update
   - id 
   - password
   - is_email_verified
   - created_at
   - updated_at
# Validation Rules  
- first_name
   . Optional
   . 2 - 50 characters
- last_name 
   . optional
   . 2 - 50 characters
- username 
   . optional
   . 3 - 30 characters
   . unique
- email
   . optional
   . valid email format
   . Unique
# Email Change flow
User changes email -> Update Email -> set is_email_verified=flase -> delete/revoke old verification tokens -> generate new verification token -> send verification email 
# Backend workflow
Recieve request -> validate access tokens -> validate rquest data -> check username uniqueness(if changed) -> check Email uniqueness(if changed) -> update profile -> if email changed
                                    . mark email verified
                                    . generate verififcation token
                                    . send verification email
-> commit transaction -> return updated profile


                  3. update profile picture endpoint
allows an authenticated user to upload or replace their profile picture . a valid accss token is required 

# Allowed file types
  - image/jpg
  - image/png
  - image/webp
maximum file size = 5 MB

                   4. get user settings endpoint
returns all settings for the authenticated user from the user settings table. authentication is required

                   5. update user settings endpoint
updates one or more user preferences . authentication is required

# validation rules
 - currency must be a supported currency
 - language must be supported
 - theme must be one of 
       . light
       . dark
       . system
 - time zone must be a valid IANA timezone
                   6. delete account endpoint
permanently deletes the authenticated user's account and all associated data. authentication is required

# Accounts API Endpoints
Method                    endpoint 
POST                      /api/v1/accounts
GET                      /api/v1/accounts
GET                     /api/v1/accounts/{account_id}
PATCH                  /api/v1/accounts/{account_id}
PATCH                 /api/v1/accounts/{account_d}/balance
DELETE               /api/v1/accounts/{account_id}

# Categories API Endpoints
method                 endpoints
POST                    /api/v1/categories
GET                    /api/v1/categories
GET                   /api/v1/categories/{category_id}
PATCH                /api/v1/categories/{category_id}
DELETE              /api/v1/categories/{category_id}

# Tags API Endpoint
Method                  endpoints
POST                    /api/v1/tags
GET                    /api/v1/tags
GET                   /api/v1/tags/{tag_id}
PATCH                /api/v1/tags/{tag_id}
DELETE              /api/v1/tags/{tag_id}

# Transaction API Endpoints
method                        endpoints
POST                       /api/v1/transactions
GET                       /api/v1/transactions
GET                      /api/v1/transactions/{trnasaction_id}
PATCH        /api/v1/transactions/{transaction_id}                  
DELETE    /api/v1/transactions/{transaction_id}
GET                    /api/v1/transactions/search
GET                   /api/v1/transactions/filter
POST                 /api/v1/transactions/bulk-delete
POST                /api/v1/transactions/bulk-update

# Transaction Attachment API Endpoints
method                        endpoints
POST           /api/v1/transactions/{transaction_id}/attachments
GET          /api/v1/transactions/{transaction_id}/attachments
DELETE      /api/v1/attachments/{attachment_id}

# Budgets API Endpoints
method                          endpoints
POST                        /api/v1/budgets
GET                        /api/v1/budgets
GET                       /api/v1/budgets/{budget_id}
PATCH                    /api/v1/budgets/{budget_id}
DELETE                  /api/v1/budgets/{budget_id}
GET           /api/v1/budgets/{budget_id}/progress      

# Savings Goals API Endpoints
method                           endpoints
POST                      /api/v1/savings-goals
GET                      /api/v1/savings-goals
GET                     /api/v1/savings-goals/{goal_id}
PATCH                  /api/v1/savings-goals/{goal_id}
DELETE                /api/v1/savings-gaols/{goal_id}
POST             /api/v1/savings-goals/{goal_id}/deposit
POST            /api/v1/savings-goals/{goal_id}/withdraw

# Recurring Transaction API Endpoints
method                           endpoints
POST        /api/v1/recurring-transactions
GET          /api/v1/recurring-transactions       
GET     /api/v1/recurring-transactions/{rcurring_transaction_id}    
PATCH /api/v1/recurring-transactions/{recurring_transactions_id}    
DELETE  /api/v1/recurring-transactions/{recurring_transaction_id}   
PATCH  /api/v1/recurring-transactions{id}/pause
PATCH  /api/v1/recurring-transactions/{id}/resume

# Notification API Endpoints
method                            endpoints
GET               /api/v1/notifications
GET             /api/v1/notifications/{notification_id}
PATCH         /api/v1/notifications/{notification_id}/read
PATCH       /api/v1/notifications/read-all
DELETE     /api/v1/notifications/{notification_id}
DELETE    /api/v1/notifications

# Reports and Analytics API Endpoints
method                           endpoints
GET                    /api/v1/reports/dashboard
GET                   /api/v1/reports/income-expense
GET                  /api/v1/reports/category-breakdown
GET                 /api/v1/reports/account-summary
GET                /api/v1/reports/monthly-summary
GET               /api/v1/reports/cash-flow
GET              /api/v1/reports/budget-performance
GET             /api/v1/reports/savings-progress
GET            /api/v1/reports/export/pdf
GET           /api/v1/reports/export/csv
GET          /api/v1/reports/export/excel




