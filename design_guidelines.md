# Design Guidelines: Campus AI Assistant

## Design Approach
**Selected Approach**: Design System (Material Design + Linear influences)

**Rationale**: This is a utility-focused student productivity tool where efficiency, clarity, and information hierarchy are paramount. Drawing from Material Design's content-rich patterns combined with Linear's clean typography and professional aesthetic.

**Key Design Principles**:
- Information clarity over visual flair
- Immediate access to chat functionality
- Scannable event/deadline displays
- Professional yet approachable for students

---

## Core Design Elements

### A. Typography
**Font Families**:
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for timestamps, course codes)

**Type Scale**:
- Hero/Page Title: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Chat Messages: text-base (16px)
- Event Titles: text-lg font-medium (18px)
- Metadata/Timestamps: text-sm (14px)
- Helper Text: text-xs (12px)

**Hierarchy**:
- Bold weights (font-semibold, font-bold) for titles and key information
- Medium weight for interactive elements
- Regular weight for body content
- Muted text for secondary information (timestamps, locations)

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16**
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-4, space-y-8
- Grid gaps: gap-4, gap-6
- Message spacing: space-y-3

**Container Strategy**:
- Full-width chat interface: w-full
- Content max-width: max-w-4xl (centered for readability)
- Sidebar width: w-64 or w-80
- Chat message width: max-w-3xl

**Layout Patterns**:
- Single-column chat interface (primary view)
- Two-column split for desktop: sidebar (resources/quick actions) + main chat area
- Card-based grid for events/deadlines: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stacked mobile layout with collapsible sidebar

---

### C. Component Library

#### Navigation
- **Top Header**: Fixed header with app logo, current section indicator, user profile/settings icon
- **Sidebar** (Desktop): Persistent left panel with quick links (Today's Events, Upcoming Deadlines, Tutoring Hours, Settings)
- **Mobile Navigation**: Hamburger menu with slide-out drawer

#### Chat Interface
- **Chat Container**: Full-height scrollable area with messages aligned left (AI) and right (User)
- **Message Bubbles**: Rounded corners (rounded-lg), distinct styling for user vs AI messages
- **Input Area**: Fixed bottom input with textarea, send button, and voice input icon
- **Typing Indicator**: Three animated dots when AI is processing
- **Suggested Queries**: Pill-shaped buttons below input showcasing example questions

#### Data Display Components

**Event Cards**:
- Compact card design with event title, date/time, location, category badge
- Border-left accent for quick visual categorization
- Hover state with subtle elevation

**Deadline Cards**:
- Time-sensitive styling with urgency indicators (due today, this week, upcoming)
- Progress bars for ongoing assignments
- Visual countdown elements

**Tutoring Schedule**:
- Table or list view with tutor name, subject, availability slots
- Quick "Book Session" CTA buttons
- Filter by subject/availability

**Response Formatting**:
- Structured AI responses with clear sections
- Bulleted lists for multiple events/deadlines
- Inline badges for categories (Academic, Social, Career, etc.)
- Clickable links to full event details

#### Forms & Inputs
- **Search/Chat Input**: Large, prominent textarea with placeholder text
- **Filters**: Dropdown menus and tag selectors for refining results
- **Date Pickers**: Calendar widgets for deadline setting

#### Overlays
- **Event Detail Modal**: Full event information with RSVP/calendar add options
- **Settings Panel**: Slide-in from right for preferences
- **Quick Action Menu**: Floating action button with contextual shortcuts

---

### D. Animations
**Minimal and Purposeful**:
- Message entry: Subtle fade-in for new chat messages (200ms)
- Typing indicator: Gentle pulsing dots
- Card hover: Slight lift (2px translateY)
- Modal transitions: 300ms ease-in-out
- NO scroll-triggered animations
- NO complex page transitions

---

## Page-Specific Guidelines

### Main Chat Interface
**Layout**: Single-column focus with optional collapsible sidebar
- Header: 64px height with app branding
- Chat area: Remaining viewport height minus input (calc(100vh - 128px))
- Input bar: Fixed 64px height at bottom
- Messages: Padded container with max-w-3xl centered

**Key Features**:
- Persistent chat history
- Time-stamped messages
- Quick action chips (e.g., "Show today's events", "Check deadlines")
- Context-aware suggestions based on time of day

### Events Dashboard
**Layout**: Grid-based card layout
- Filter bar at top with category pills
- 3-column grid on desktop (grid-cols-3)
- 2-column on tablet (md:grid-cols-2)
- Single column on mobile
- Infinite scroll or pagination for large event lists

### Tutoring Finder
**Layout**: Split view or tabbed interface
- Left: Subject/availability filters
- Right: Matching tutors with availability calendar
- Bottom: Booking confirmation panel

---

## Image Strategy
**No Hero Images**: This is a utility application, not a marketing site. Lead directly with the chat interface.

**Supporting Images**:
- Avatar placeholders for chat (user icon, AI assistant icon)
- Event category icons (academic cap, calendar, briefcase)
- Empty state illustrations (e.g., "No upcoming deadlines")
- Profile images for tutors (if available from API)

Use **Heroicons** for all interface icons (via CDN).

---

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus indicators on all interactive elements
- Keyboard navigation for chat input and quick actions
- Screen reader labels for icon buttons
- Semantic HTML for chat messages (article, time elements)

---

## Design Inspiration References
- **Linear**: Clean typography, subtle interactions, professional aesthetic
- **Material Design 3**: Card components, elevation system, responsive grids
- **Notion**: Information hierarchy, content organization, clean data tables