# Event Discovery App — UI/UX Specification

## 1. Purpose

This document defines the user interface and interaction behavior for the Event Discovery application.

It focuses on:

- Screen structure
- Navigation
- Content hierarchy
- Interaction patterns
- Reusable UI elements
- Visual behavior
- Empty/loading/error states
- Modal and sheet behavior
- Navigation continuity
- User experience consistency

This document does not define technical implementation details, frameworks, APIs, platform architecture, or data models.

The goal is to ensure the Android and iOS applications feel consistent in product behavior while still respecting native platform conventions where appropriate.

---

# 2. Design Goals

The application should feel:

- Modern
- Visual
- Fast
- Easy to scan
- Friendly
- Content-first
- Discovery-oriented
- Polished without being visually overloaded

The app should not feel like:

- A calendar application
- A ticket marketplace
- A social network
- A generic database browser
- A business dashboard

The visual experience should encourage users to explore events even when they do not have a specific plan in mind.

---

# 3. Navigation Structure

The main application uses four primary destinations:

- Discover
- Search
- Saved
- Settings

These destinations should remain accessible through the primary navigation of the application.

Navigation labels and icons should both be visible where appropriate.

---

# 4. Main Navigation Behavior

The primary navigation should behave predictably.

Switching between primary destinations should preserve useful state when appropriate.

Example:

A user scrolls through Discover.

They switch to Saved.

They return to Discover.

Their previous scroll position should ideally still be preserved.

Similarly:

A user performs a search.

They switch briefly to Saved.

Returning to Search should not automatically erase the query unless the product intentionally starts a new search.

---

# 5. Screen Hierarchy

The application hierarchy should roughly follow:

Discover
→ Event List
→ Event Details

Search
→ Search Results
→ Event Details

Saved
→ Event Details

Settings
→ Location
→ Interests
→ Notifications
→ Appearance

Additional temporary surfaces may include:

- Filter sheet
- Location selector
- Date picker
- Share interface
- Contextual confirmation or undo messages

---

# 6. Global Screen Layout

Most primary screens should use a consistent vertical structure:

1. Top navigation area
2. Optional screen-specific controls
3. Main scrollable content
4. Primary navigation

Avoid placing too many fixed elements on the screen.

Content should remain the focus.

---

# 7. Global Visual Hierarchy

The highest priority information throughout the application is:

1. Event name
2. Event date
3. Event image
4. Venue/location
5. Time
6. Price
7. Category or secondary metadata

Date and title should usually be understandable without opening the event.

---

# 8. Discover Screen

## Purpose

Discover should immediately answer:

"What interesting events are happening around me?"

The screen should feel dynamic and curated rather than like one long search-results list.

---

## Discover Header

The top area should contain:

- Current location
- Optional greeting or contextual heading
- Search shortcut if appropriate

Example:

Discover

Mexico City ▼

or:

Explore Mexico City

The location control should be easy to identify as interactive.

Avoid making the header unnecessarily tall.

---

# 9. Location Control

The active location should appear near the top of Discover.

Example:

Mexico City ▼

Selecting it should open the Location Selection experience.

The selected city should remain visually obvious without dominating the screen.

---

# 10. Quick Date Selector

Below the main header, display quick date options.

Example:

Today

Tomorrow

This Weekend

This Week

More

These should behave like selectable chips or compact controls.

Only one primary quick-date option should generally be active at a time.

The active selection should be visually distinct.

---

# 11. Category Selector

Categories should appear as easy-to-scan compact items.

Examples:

Music

Sports

Comedy

Food

Arts

Festivals

Categories may use:

- Icons
- Small illustrations
- Labels
- Compact cards

Avoid overly large category cards that consume most of the initial screen.

Selecting a category should clearly transition into a category-specific listing or filtered discovery experience.

---

# 12. Discover Content Sections

Discover should consist of vertically stacked sections.

Example:

This Weekend

[ Event Card ] [ Event Card ] [ Event Card ]

Popular Near You

[ Event Card ] [ Event Card ] [ Event Card ]

Free Events

[ Event Card ] [ Event Card ] [ Event Card ]

Recommended For You

[ Event Card ] [ Event Card ] [ Event Card ]

---

# 13. Section Header

Each Discover section should contain:

- Section title
- Optional short subtitle
- Optional "See All" action

Example:

This Weekend                         See All

The "See All" action should open the full event list associated with that section.

Do not show "See All" if there is nothing additional to browse.

---

# 14. Discover Event Cards

Event cards in horizontal discovery sections should prioritize imagery.

Suggested structure:

[ EVENT IMAGE ]

SAT, SEP 12

Arctic Monkeys

Foro Sol

From $900 MXN

♡ Save

Cards should be large enough to communicate useful information but small enough that part of the next card is visible when horizontally scrolling.

Showing part of the next card can communicate that the list is scrollable.

---

# 15. Event Card Image

The event image should:

- Have a consistent aspect ratio
- Be visually prominent
- Crop gracefully
- Avoid stretching
- Include an appropriate fallback if no image exists

The save action may appear over the image if readability is maintained.

---

# 16. Save Control

A save action should appear consistently on event cards.

Use a familiar bookmark, heart, or save metaphor.

Do not switch between unrelated icon concepts throughout the app.

Saved and unsaved states must be immediately distinguishable.

Tapping Save should not open Event Details.

---

# 17. Full Event List Screen

Screens such as:

- This Weekend
- Music
- Free Events
- Popular Near You

should use a vertically scrolling event list.

The screen should contain:

- Title
- Optional description
- Filter action
- Active filter indicators
- Results

Example:

This Weekend

[Filters]

42 events

[ Event Row ]

[ Event Row ]

[ Event Row ]

---

# 18. Vertical Event Result Card

The vertical event card should prioritize efficient scanning.

Suggested structure:

[IMAGE]   SAT, SEP 12
          Arctic Monkeys
          Foro Sol
          8:00 PM
          From $900 MXN
          ♡

or a larger stacked variation when more visual emphasis is desired.

Use one primary card style consistently across Search, Saved, and Event Lists when possible.

---

# 19. Search Screen

## Default State

Before a user performs a search, show:

- Search input
- Recent searches
- Suggested categories
- Optional discovery shortcuts

Avoid showing an empty page beneath the search field.

---

# 20. Search Input

The search field should be visually prominent.

Placeholder:

Search events, artists, venues...

The user should be able to clear their query quickly.

When the user enters Search intentionally, the field may receive focus automatically if that behavior feels natural on the platform.

---

# 21. Search Suggestions

As the user types, suggestions may appear.

Example:

User types:

jazz

Possible suggestions:

Jazz concerts

Jazz festivals

Jazz clubs

Jazz Night at Venue X

Suggestions should be clearly distinguishable from full search results.

---

# 22. Recent Searches

Display recent searches when the search field is empty.

Example:

Recent

Jazz

Coldplay

Comedy

Each search can have a small remove action.

Include:

Clear All

only when recent searches exist.

---

# 23. Search Results

Once a query is submitted, display:

- Query
- Filter control
- Active filters
- Result count where useful
- Event results

Avoid placing too many controls above the results.

Users should reach actual event content quickly.

---

# 24. Search Empty State

When there are no matching results:

Use a dedicated centered or visually balanced empty state.

Example:

No events found

We couldn't find events matching "Jazz Festival."

Try changing your dates or removing some filters.

Actions:

Clear Filters

Search Again

---

# 25. Filters Entry Point

Filtering should typically be accessed from a prominent but secondary action.

Example:

Filters

If filters are active:

Filters · 3

or

Filters (3)

The active state should be obvious without requiring the user to reopen the filter interface.

---

# 26. Filter Interface

Filters should appear in a temporary focused surface.

Depending on the platform and screen size, this could be:

- Bottom sheet
- Modal sheet
- Full-screen modal

The product behavior should remain the same.

---

# 27. Filter Sheet Structure

Suggested structure:

Filters

Date

[Today] [Tomorrow] [Weekend]

Category

[Music]
[Comedy]
[Food]
[...]

Price

[Any] [Free] [Paid]

Distance

[10 km ▼]

Time

[Any] [Morning] [Afternoon] [Evening]

Reset                         Show 42 Events

The primary action should remain easy to access even if the filter content scrolls.

---

# 28. Filter Interaction

Changing filter values should not cause the sheet to unexpectedly close.

Users should be able to configure multiple filters before applying.

The primary action may communicate expected results.

Example:

Show 24 Events

If the result count is unavailable, use:

Apply Filters

---

# 29. Reset Filters

A Reset action should return filters to the default state.

Reset should not require confirmation.

If no filters are active, the Reset action may be disabled or hidden.

---

# 30. Active Filter Chips

After filters are applied, show relevant filters as removable chips where space allows.

Example:

Music ×

This Weekend ×

Free ×

Selecting × removes only that specific filter.

Avoid requiring users to reopen the entire filter interface to remove one simple condition.

---

# 31. Event Details Screen

## Overall Goal

Event Details should feel visually immersive while remaining highly readable.

The main question the page answers is:

"Do I want to attend this?"

---

# 32. Event Details Header

The top area should include:

- Large event image
- Back navigation
- Save action
- Share action

Controls displayed over imagery must remain readable regardless of the image.

---

# 33. Event Details Primary Information

Immediately after the hero image, show:

Event title

Date and time

Venue

Location

Price

Example:

Arctic Monkeys

Saturday, September 12

8:00 PM

Foro Sol · Mexico City

From $900 MXN

The user should not need to scroll far to understand the event basics.

---

# 34. Ticket Call to Action

A prominent action should appear relatively early.

Example:

Get Tickets

This should be the main primary action on Event Details when ticket information exists.

If there is no ticket link, do not show a disabled primary button unnecessarily.

---

# 35. Description Section

Use a clearly separated content section.

Example:

About

Event description...

If the description is long:

Show More

Initially show enough text for the user to understand the event.

Expanding the description should not unexpectedly change scroll position.

---

# 36. Location Section

Display venue and location clearly.

Example:

Location

Foro Sol

Av. Viaducto Río de la Piedad...

View Location

If a visual location preview exists in a future version, it should support the text rather than replace it.

---

# 37. Event Metadata

Additional event information can use compact rows.

Example:

Doors open       7:00 PM

Age restriction  18+

Organizer         Example Events

Duration          3 hours

Only display rows that contain useful information.

---

# 38. Similar Events

If included, place Similar Events near the bottom.

Example:

You May Also Like

[ Event Card ][ Event Card ]

Do not position recommendations before essential information about the current event.

---

# 39. Saved Screen

The Saved screen should feel like a personal event shortlist.

Header:

Saved

Possible tabs or sections:

Upcoming

Past

---

# 40. Saved Upcoming

Upcoming should be the default view.

Sort events chronologically.

The nearest event should appear first.

Contextual labels may appear.

Example:

Tomorrow

SAT, SEP 12

Arctic Monkeys

Foro Sol

---

# 41. Saved Past

Past events should be visually secondary.

Example:

Past Events

A past event should clearly display:

Ended

or

Aug 24 · Ended

Avoid making past events appear actionable as upcoming events.

---

# 42. Saved Empty State

When there are no saved events:

Use a friendly visual empty state.

Example:

No saved events yet

Save events you're interested in and they'll appear here.

[Discover Events]

---

# 43. Unsaving from Saved

Tapping the Save control again should remove the event.

Avoid showing a confirmation dialog.

Optionally provide a short temporary undo message:

Removed from Saved

Undo

---

# 44. Location Selection Screen

The location selector should feel lightweight.

Suggested layout:

Choose Location

[ Search cities ]

Current Location

Use My Location

Recent

Mexico City

Los Angeles

Guadalajara

---

# 45. City Search

The city search should provide suggestions while typing.

Example:

User enters:

Monter

Results:

Monterrey, Nuevo León, Mexico

Monterey, California, United States

Clearly differentiate cities with similar names.

---

# 46. Selected City

Selecting a city should:

- Update the active location
- Close or leave the selection experience
- Refresh relevant event discovery

The user should not need an additional confirmation step unless there is a meaningful reason.

---

# 47. Location Permission

When location access is needed, explain the benefit first.

Example:

Find events near you

Allow location access to discover events happening around your current area.

Actions:

Use My Location

Choose a City Instead

Users should never feel forced to grant permission.

---

# 48. Onboarding

Onboarding should be visually simple and short.

Recommended maximum:

3 meaningful steps.

---

# 49. Welcome Screen

Suggested content:

Illustration or visual

Discover something to do

Find concerts, festivals, sports, food, and experiences happening around you.

[Get Started]

Avoid dense explanatory text.

---

# 50. Location Onboarding

Heading:

Where do you want to explore?

Options:

Use My Location

Choose a City

The user should be able to proceed quickly.

---

# 51. Interests Onboarding

Heading:

What are you into?

Use a visually engaging selection grid.

Examples:

Music

Sports

Comedy

Food

Arts

Nightlife

Festivals

Technology

Users may select multiple.

Actions:

Continue

Skip

---

# 52. Interest Selection State

Selected interests should have a strong visual state.

Do not rely exclusively on subtle color changes.

Use an additional indicator such as:

- Check mark
- Border
- Filled background
- Selection icon

---

# 53. Settings Screen

Settings should use grouped sections.

Example:

Discovery

Location
Mexico City >

Interests
Music, Food, Comedy >

Notifications

Event Reminders
On >

Appearance

Theme
System >

About

About Event App >

---

# 54. Settings Navigation

Settings rows that open another screen should clearly communicate navigation.

Rows that change simple binary values may use an inline control when appropriate.

Avoid mixing interaction styles inconsistently.

---

# 55. Appearance Selection

Appearance options:

- System Default
- Light
- Dark

Use a straightforward selection interface.

One option should always be active.

---

# 56. Notification Settings

Notification settings should remain simple.

Example:

Event Reminders

Remind me about saved events

[On]

Default reminder

1 day before >

Do not add promotional notification controls unless promotional notifications are actually part of the product.

---

# 57. Event Reminder Selection

If reminder selection exists per event, it may appear after saving or inside Event Details.

Example:

Reminder

No Reminder

1 hour before

2 hours before

1 day before

Users should not be forced to configure reminders every time they save an event.

---

# 58. Loading States

Use structured loading placeholders that resemble eventual content.

Example:

Discover loading:

[Category placeholder]

[Event image placeholder]
[Title placeholder]
[Metadata placeholder]

Avoid using only a centered loading spinner for an entire content-heavy screen.

---

# 59. Incremental Loading

When additional results load during scrolling:

Show a compact loading indicator near the end of the current content.

Do not replace existing results.

---

# 60. Error States

Errors should use clear, human language.

Example:

Something went wrong

We couldn't load events right now.

[Try Again]

Avoid technical error codes or implementation details.

---

# 61. Partial Error States

Discover may contain multiple independent sections.

If one section fails:

Keep successful sections visible.

Example:

Popular Near You

Couldn't load this section.

Try Again

Do not replace the entire Discover screen with an error if only one section failed.

---

# 62. Offline Experience

If the app has no current connection:

Show a subtle but clear message.

Example:

You're offline

Some event information may not be up to date.

If useful previously loaded content exists, continue displaying it.

---

# 63. Empty State Principles

An empty state should answer:

1. What happened?
2. What can I do next?

Good:

No events found this weekend

Try another date or increase your search area.

[Change Date]

Poor:

No Data

---

# 64. Temporary Feedback

Use short temporary messages for lightweight actions.

Examples:

Saved

Removed from Saved

Filters cleared

Location changed to Mexico City

Avoid showing modal dialogs for successful everyday actions.

---

# 65. Destructive Confirmation

Only use confirmation when an action has meaningful consequences.

Saving and unsaving events do not require confirmation.

Clearing recent searches may also happen immediately or through a lightweight confirmation depending on final UX.

Do not overuse alerts.

---

# 66. Back Navigation

Back should preserve context whenever possible.

Example:

Search:

Jazz

Filters:

Free
This Weekend

User opens Event Details.

After Back:

The user returns to the same Jazz results with the same filters and approximately the same scroll position.

---

# 67. Scroll Preservation

Preserve scroll position when navigating into Event Details and returning.

This is particularly important for:

- Discover
- Search Results
- Category Lists
- Saved

Users should not lose their place while browsing.

---

# 68. Deep Navigation Continuity

If the user arrives directly at an event through an external link or notification:

Event Details should still provide a coherent navigation experience.

Back should return to an appropriate destination rather than creating an unusable navigation stack.

---

# 69. Sharing

The Share action should be visible but secondary to the primary event action.

Typical placement:

- Top-right action
- Event action area

Sharing should invoke the device's expected sharing experience.

Do not create a custom social-sharing screen unless required later.

---

# 70. External Ticket Experience

When users select Get Tickets:

Clearly communicate that they are leaving or viewing an external provider when appropriate.

The user should not mistake the application for the actual ticket seller.

---

# 71. Typography Hierarchy

Use a clear hierarchy.

Example:

Screen title

Large

Section heading

Medium / emphasized

Event title

Strong emphasis

Date

Strong accent or emphasis

Metadata

Secondary

Description

Body

Avoid excessive typography sizes.

---

# 72. Date Emphasis

Event dates deserve stronger emphasis than most secondary metadata.

Users often decide whether an event is relevant primarily by date.

Examples:

SEP 12

SAT · SEP 12

Tomorrow

This Saturday

Dates may use a visual accent while maintaining readability.

---

# 73. Price Presentation

Price should be clear but secondary to event title and date.

Examples:

Free

From $500

$300–$800

If pricing is unknown, omit it rather than showing:

Unknown

---

# 74. Content Density

The app should show enough information to help users decide whether an event is relevant without overwhelming each card.

Do not place the entire event description inside an event card.

Cards are for discovery.

Details belong on Event Details.

---

# 75. Icons

Use familiar icon concepts.

Examples:

Search

Magnifying glass

Saved

Bookmark or heart

Location

Pin

Share

Standard share symbol

Filters

Filter/sliders symbol

Date

Calendar

Avoid custom abstract icons when established symbols already exist.

---

# 76. Animation and Motion

Motion should support understanding.

Useful examples:

- Save icon transition
- Sheet opening
- Content loading
- Navigation transitions
- Selection state transitions
- Expand/collapse description

Avoid unnecessary decorative animation.

Interactions should feel responsive rather than flashy.

---

# 77. Image Loading

Event images may load after text content.

The layout should not jump dramatically when images arrive.

Use consistent placeholder dimensions.

If an image cannot be loaded:

Use a visually acceptable fallback while preserving card layout.

---

# 78. Accessibility

The product should remain usable with larger text sizes.

Interactive controls should have comfortable touch targets.

Do not communicate critical information only through color.

Examples:

Cancelled events should display text such as:

Cancelled

rather than only using red styling.

Saved states should have an icon/state change in addition to color.

---

# 79. Long Event Titles

Cards should gracefully handle long titles.

Example:

International Independent Film Festival of Mexico City 2026

Cards may limit the number of visible lines.

Event Details should show the full title.

---

# 80. Long Venue Names

Venue names may also be long.

Avoid allowing venue text to overwhelm the event title.

Use reasonable truncation on cards.

Show full venue information on Event Details.

---

# 81. Missing Images

Events without images should still produce visually coherent cards.

Use a fallback based on:

- Event category
- Neutral branded placeholder
- Simple visual treatment

Do not leave a broken image area.

---

# 82. Missing Prices

Do not display:

$0

unless the event is explicitly known to be free.

If pricing is unavailable, simply omit the price.

---

# 83. Cancelled Events

Cancelled events require clear presentation.

Cards:

Cancelled

Event Details:

CANCELLED

This event has been cancelled.

Ticket calls to action should be removed or clearly disabled when inappropriate.

---

# 84. Past Events

Past events should remain viewable if accessed through Saved or another appropriate context.

Display:

Event Ended

Do not show urgency or upcoming-event actions.

---

# 85. Responsive Layout

The experience should adapt gracefully to different screen sizes.

On compact phones:

Favor vertical content and modal/bottom-sheet patterns.

On larger devices:

Additional horizontal space may allow:

- Multi-column grids
- Wider cards
- Side-by-side event information
- Persistent supporting panels

The product hierarchy should remain consistent.

---

# 86. Tablet / Large Screen Discover

On wider displays, Discover may display more event cards simultaneously.

Example:

This Weekend

[Card] [Card] [Card]

Popular Near You

[Card] [Card] [Card]

Avoid simply stretching mobile cards to excessive widths.

---

# 87. Event Details on Large Screens

On wider screens, Event Details may place:

Event image

alongside

Primary event information

rather than stacking everything vertically.

The user should still perceive one clear information hierarchy.

---

# 88. Consistency Between Android and iOS

The application should provide the same:

- Features
- Information hierarchy
- Terminology
- Core workflows
- Product behavior

However, native platform conventions should be respected for:

- Back behavior
- Sheets
- Navigation gestures
- Share interfaces
- Date selection
- Permission experiences
- System appearance

Pixel-perfect visual duplication across platforms is not required.

Product consistency is more important than identical implementation.

---

# 89. Design System Components

The UI should rely on reusable product components.

Suggested components:

- Event card
- Event row
- Event image
- Category chip
- Filter chip
- Date chip
- Primary button
- Secondary button
- Save action
- Section header
- Empty state
- Error state
- Loading card
- Settings row
- Location row
- Interest chip/card
- Status badge

These components should behave consistently throughout the product.

---

# 90. Button Hierarchy

Each screen should generally have only one visually dominant action.

Example Event Details:

Primary:

Get Tickets

Secondary:

Save

Share

View Location

Avoid multiple competing primary buttons.

---

# 91. Status Badges

Use compact badges when important.

Examples:

Free

Today

Cancelled

Sold Out

Selling Fast

Event Ended

Only use statuses supported by actual event information.

Do not create artificial urgency.

---

# 92. Interaction Feedback

Every tap should produce clear feedback.

Examples:

Save:

Icon immediately changes.

Filter:

Selected chip changes state.

Interest:

Selection indicator appears.

Location:

New location becomes visible.

Avoid interactions where users must guess whether their action worked.

---

# 93. Pull to Refresh

Primary event feeds may support a familiar refresh gesture where appropriate.

Refreshing should not:

- Reset location
- Reset interests
- Clear saved events
- Reset unrelated preferences

---

# 94. Initial App Launch

After onboarding is complete, normal launches should open into Discover.

Users should immediately see useful content.

Avoid:

Splash
→ Empty loading screen
→ Another intermediate screen
→ Discover

Keep the path to meaningful content short.

---

# 95. End-to-End UX Scenario

A typical experience should look like this:

User opens app.

↓

Discover appears.

Mexico City

Today | Tomorrow | This Weekend | This Week

↓

User selects This Weekend.

↓

Recommended event sections update.

↓

User sees:

Arctic Monkeys

Saturday · 8:00 PM

Foro Sol

↓

User saves the event directly from the card.

↓

Save icon changes immediately.

↓

User opens the event.

↓

Large event image

Arctic Monkeys

Saturday, September 12

8:00 PM

Foro Sol · Mexico City

From $900 MXN

[Get Tickets]

↓

User reads description.

↓

User taps Back.

↓

They return to exactly where they were browsing.

↓

User opens Saved.

↓

Arctic Monkeys appears under Upcoming.

This journey should feel continuous and predictable.

---

# 96. Search UX Scenario

User opens Search.

↓

Recent searches appear.

↓

User searches:

Jazz

↓

Results appear.

↓

User selects Filters.

↓

Chooses:

This Weekend

Free

↓

Selects:

Show 12 Events

↓

Results update.

Active chips show:

This Weekend ×

Free ×

↓

User opens an event.

↓

Back returns to the same filtered Jazz results.

The query and filters must not unexpectedly disappear.

---

# 97. No Results UX Scenario

User searches:

Jazz

Location:

Small city

Date:

Tomorrow

↓

No events are found.

Instead of a blank list, show:

No events found

We couldn't find Jazz events tomorrow near this location.

Try expanding your search.

Actions:

Change Date

Clear Filters

The experience should help the user continue rather than reaching a dead end.

---

# 98. UX Priorities

When tradeoffs are required, prioritize in this order:

1. Understandability
2. Discoverability
3. Speed of interaction
4. Content visibility
5. Consistency
6. Visual polish
7. Decorative effects

A beautiful screen that makes the event date difficult to find is considered a poor design.

---

# 99. Things to Avoid

Do not:

- Hide important event information behind unnecessary taps.
- Require account creation before browsing.
- Use too many modal dialogs.
- Make every card visually different.
- Overload cards with metadata.
- Reset user context unexpectedly.
- Use huge headers that hide event content.
- Depend on location permission for basic usage.
- Show empty sections.
- Present unknown prices as free.
- Create artificial ticket urgency.
- Make promotional notifications part of the core experience.
- Turn the app into a ticket marketplace.
- Turn the app into a social network.

---

# 100. Definition of a Polished UX

The UI/UX can be considered successful when:

- A first-time user understands the app immediately.
- Useful events are visible within seconds.
- Users can discover events without searching.
- Search feels fast and predictable.
- Filters are easy to understand and remove.
- Event details clearly communicate date, venue, price, and attendance options.
- Saving an event is effortless.
- Users never lose their browsing context unnecessarily.
- Empty and error states help users recover.
- Navigation feels natural on Android and iOS.
- The product feels intentionally designed rather than assembled from unrelated screens.

---

# Instructions for AI Agents

When creating UI based on this specification:

1. Prioritize event content over decorative UI.
2. Maintain consistent components across screens.
3. Preserve user state and navigation context.
4. Include loading, error, empty, and success states.
5. Do not invent additional navigation destinations.
6. Do not introduce account or social features.
7. Respect native Android and iOS interaction conventions.
8. Do not force the platforms to look pixel-identical.
9. Use clear hierarchy for event title, date, venue, and primary actions.
10. Keep cards focused on discovery and Event Details focused on deeper information.
11. Avoid unnecessary dialogs and confirmations.
12. Make all important actions visibly responsive.
13. Keep the MVP scope defined by the main Product Specification.
14. Treat this document as the source of truth for UI behavior unless a newer feature-specific design specification explicitly overrides it.