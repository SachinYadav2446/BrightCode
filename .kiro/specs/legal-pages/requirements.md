# Requirements Document

## Introduction

BrightCode is a competitive coding and learning platform for developers. It provides user accounts, coding challenges, a leaderboard, factions, a real-time collaborative workspace, and an arcade of skill-based exercises. The platform collects user data (email, username, XP, activity, bio, stack, skills) and uses browser storage (localStorage) for session and progress data.

Three legal pages are required — Privacy Policy (`/privacy`), Terms of Service (`/terms`), and Cookie Policy (`/cookies`) — linked from the About/footer section of the Home page. Each page must be a standalone React page matching the platform's dark, premium aesthetic, and must contain legally appropriate, detailed content relevant to BrightCode's actual features.

## Glossary

- **BrightCode**: The competitive coding and learning platform operated at brightcode.io.
- **Platform**: The BrightCode web application, including all pages, services, and APIs.
- **User**: A registered account holder on the Platform.
- **Visitor**: Any person accessing the Platform without a registered account.
- **Personal Data**: Any information that identifies or can identify a User or Visitor (e.g., email address, username, IP address).
- **Legal_Page**: Any of the three pages: Privacy Policy, Terms of Service, or Cookie Policy.
- **Legal_Page_Router**: The React Router configuration in `client/src/App.jsx`.
- **Legal_Page_Component**: A React JSX component rendering a Legal_Page.
- **Legal_Page_Stylesheet**: A CSS file scoped to a Legal_Page_Component.
- **About_Section**: The footer section of the Home page containing links to the Legal Pages.
- **Cookie**: A small data file stored in the browser by the Platform.
- **Session_Cookie**: A Cookie used to maintain a User's authenticated session.
- **Analytics_Cookie**: A Cookie used to collect usage and performance data.
- **Preference_Cookie**: A Cookie used to store User interface preferences.
- **Content**: The legal text, headings, and structured sections within a Legal_Page.
- **Effective_Date**: The date from which a Legal_Page's Content is in force.

---

## Requirements

### Requirement 1: Privacy Policy Page

**User Story:** As a User or Visitor, I want to read BrightCode's Privacy Policy, so that I understand what personal data is collected, how it is used, and what rights I have over my data.

#### Acceptance Criteria

1. WHEN a User or Visitor navigates to `/privacy`, THE Platform SHALL render the Privacy Policy Legal_Page_Component.
2. THE Privacy Policy Legal_Page_Component SHALL display an Effective_Date at the top of the page.
3. THE Privacy Policy Legal_Page_Component SHALL include a section describing what Personal Data is collected, including email address, username, XP, activity data, bio, skills, and stack.
4. THE Privacy Policy Legal_Page_Component SHALL include a section describing how collected Personal Data is used, covering account management, leaderboard display, platform improvement, and support communications.
5. THE Privacy Policy Legal_Page_Component SHALL include a section describing data storage and security practices, including that passwords are hashed and that data is stored server-side in JSON-based storage.
6. THE Privacy Policy Legal_Page_Component SHALL include a section describing data sharing practices, stating that Personal Data is not sold to third parties.
7. THE Privacy Policy Legal_Page_Component SHALL include a section describing User rights, including the right to access, correct, and request deletion of Personal Data.
8. THE Privacy Policy Legal_Page_Component SHALL include a section describing data retention, stating how long User data is kept after account deletion.
9. THE Privacy Policy Legal_Page_Component SHALL include a section describing the use of localStorage for arcade progress and session data.
10. THE Privacy Policy Legal_Page_Component SHALL include contact information for privacy-related inquiries.
11. WHEN a User or Visitor clicks the back navigation control on the Privacy Policy page, THE Legal_Page_Router SHALL navigate the User to the previous page in browser history.

---

### Requirement 2: Terms of Service Page

**User Story:** As a User or Visitor, I want to read BrightCode's Terms of Service, so that I understand the rules, rights, and responsibilities governing my use of the Platform.

#### Acceptance Criteria

1. WHEN a User or Visitor navigates to `/terms`, THE Platform SHALL render the Terms of Service Legal_Page_Component.
2. THE Terms of Service Legal_Page_Component SHALL display an Effective_Date at the top of the page.
3. THE Terms of Service Legal_Page_Component SHALL include a section describing eligibility requirements, stating that Users must be at least 13 years of age to register.
4. THE Terms of Service Legal_Page_Component SHALL include a section describing account responsibilities, including that Users are responsible for maintaining the confidentiality of their credentials.
5. THE Terms of Service Legal_Page_Component SHALL include a section describing acceptable use of the Platform, prohibiting cheating, reverse engineering, automated scraping, and harassment of other Users.
6. THE Terms of Service Legal_Page_Component SHALL include a section describing intellectual property rights, stating that BrightCode owns all challenge content, platform code, and branding.
7. THE Terms of Service Legal_Page_Component SHALL include a section describing User-generated content, stating that Users retain ownership of code they write but grant BrightCode a non-exclusive licence to display it within the Platform.
8. THE Terms of Service Legal_Page_Component SHALL include a section describing the leaderboard and XP system, stating that BrightCode reserves the right to adjust, reset, or remove XP and rankings at its discretion.
9. THE Terms of Service Legal_Page_Component SHALL include a section describing account termination, stating the conditions under which BrightCode may suspend or terminate a User account.
10. THE Terms of Service Legal_Page_Component SHALL include a section describing disclaimers and limitation of liability, stating that the Platform is provided "as is" without warranty.
11. THE Terms of Service Legal_Page_Component SHALL include a section describing governing law.
12. WHEN a User or Visitor clicks the back navigation control on the Terms of Service page, THE Legal_Page_Router SHALL navigate the User to the previous page in browser history.

---

### Requirement 3: Cookie Policy Page

**User Story:** As a User or Visitor, I want to read BrightCode's Cookie Policy, so that I understand what cookies are used, why they are used, and how I can control them.

#### Acceptance Criteria

1. WHEN a User or Visitor navigates to `/cookies`, THE Platform SHALL render the Cookie Policy Legal_Page_Component.
2. THE Cookie Policy Legal_Page_Component SHALL display an Effective_Date at the top of the page.
3. THE Cookie Policy Legal_Page_Component SHALL include a section explaining what cookies are and how the Platform uses them.
4. THE Cookie Policy Legal_Page_Component SHALL include a section listing Session_Cookies used by the Platform, including the JWT-based authentication token stored in localStorage.
5. THE Cookie Policy Legal_Page_Component SHALL include a section listing Preference_Cookies, including localStorage keys used to persist arcade progress (e.g., `css_odyssey_solutions`, `logic_lab_solutions`, `react_quest_solutions`).
6. THE Cookie Policy Legal_Page_Component SHALL include a section describing Analytics_Cookies, stating whether third-party analytics are used and what data they collect.
7. THE Cookie Policy Legal_Page_Component SHALL include a section describing how Users can manage or delete cookies and localStorage data via their browser settings.
8. THE Cookie Policy Legal_Page_Component SHALL include a section describing the consequences of disabling cookies, including loss of session persistence and arcade progress.
9. WHEN a User or Visitor clicks the back navigation control on the Cookie Policy page, THE Legal_Page_Router SHALL navigate the User to the previous page in browser history.

---

### Requirement 4: Routing Integration

**User Story:** As a developer, I want the three legal pages registered in the React Router configuration, so that navigating to `/privacy`, `/terms`, and `/cookies` renders the correct page without a 404.

#### Acceptance Criteria

1. THE Legal_Page_Router SHALL include a route for `/privacy` that renders the Privacy Policy Legal_Page_Component.
2. THE Legal_Page_Router SHALL include a route for `/terms` that renders the Terms of Service Legal_Page_Component.
3. THE Legal_Page_Router SHALL include a route for `/cookies` that renders the Cookie Policy Legal_Page_Component.
4. THE Legal_Page_Router SHALL make all three Legal_Page routes publicly accessible without requiring authentication.

---

### Requirement 5: Visual Design Consistency

**User Story:** As a User or Visitor, I want the legal pages to look and feel like the rest of BrightCode, so that the experience is cohesive and professional.

#### Acceptance Criteria

1. THE Legal_Page_Component SHALL use the global CSS variables defined in `client/src/index.css` (e.g., `--bg-dark`, `--bg-surface`, `--primary`, `--text-main`, `--text-muted`, `--border`, `--font-sans`, `--font-mono`).
2. THE Legal_Page_Component SHALL include a back navigation button that links back to the previous page, consistent with the pattern used in existing pages such as `Docs.jsx`.
3. THE Legal_Page_Component SHALL apply a scoped Legal_Page_Stylesheet that does not conflict with global styles.
4. THE Legal_Page_Component SHALL be responsive, displaying correctly on viewport widths from 320px to 1440px and above.
5. THE Legal_Page_Component SHALL use motion animations (via `framer-motion`) for the page entry transition, consistent with other pages on the Platform.
6. THE Legal_Page_Component SHALL structure Content using clearly differentiated section headings, body text, and where appropriate, lists — all styled to match the platform's typographic hierarchy.
