# Accounts and privacy

Accounts are local demonstrations, stored in the current browser for this site.
They do not sync between browsers or devices. Clearing site data removes them.
The application does not provide secure shared authentication or send account
verification, invitation or password-reset emails.

## Account management

Members can use planning and reports. Administrators can also create accounts,
assign account types and suspend or reactivate other accounts. In **Admin
dashboard → Add user**, enter a name, email and a confirmed demo password of
10–128 characters. Creating a user keeps the administrator signed in.

Custom account types map to Member or Admin access. Their names and access levels
are fixed at creation. Self-registration still creates members. Administrators
cannot change their own role or status through the account table.

## Credentials and local data

Password, name, email and account-search inputs are masked. The demo stores salted PBKDF2 password hashes rather
than plaintext passwords. Names and email addresses are stored in browser data;
the UI uses numbered account labels in the header, admin dashboard and report
activity instead of displaying names or email addresses. Search accepts either
an account label or the original name/email. Account numbers follow storage
order; they remain consistent when filtering the table.
Use fictional account details and a password used only for this demo.

Visual masking does not encrypt browser storage or make this a secure multiuser
system. Forecast fitting runs in a browser worker and does not upload imported
data. Application libraries are loaded from external CDNs.

[Wiki home](Home.md)
