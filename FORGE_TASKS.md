# Forge Implementation Tasks

## iOS app convention fixes

- [x] Replace the current top navigation tabs with an iOS-style bottom tab bar.
- [x] Use 5 primary tabs: This Week, Members, Forge, Stakes, Account.
- [ ] Add a prominent center action state for Submit or Nuke depending on the current weekly phase.
- [x] Ensure all tappable controls meet a minimum 44x44 touch target.
- [x] Add safe-area spacing for iPhone-style bottom navigation.
- [x] Convert secondary actions into native-feeling bottom sheets or modal sheets.
- [ ] Add clear pressed, disabled, loading, and confirmed states for buttons.
- [x] Standardize card radii, spacing, blur, shadows, and dark-mode hierarchy.

## Notifications and inbox

- [x] Add a top-right bell icon with unread badge.
- [x] Add a dedicated Inbox tab.
- [x] Create a mock notification feed.
- [x] Add notification categories: Stakes, Submissions, Roasts, System, BS Audits.
- [x] Add notification detail sheet.
- [x] Add “mark all read” action.
- [x] Show mock competitive notifications:
  - [x] James raised the pot by $150.
  - [x] Angus matched the raise.
  - [x] Noah still has not submitted.
  - [x] Sunday Portal opens in 2 hours.
  - [x] Vulture Protocol risk: group output trending weak.
  - [x] BS Button audit window closes soon.

## Arena engagement systems

- [x] Add a live activity feed to the Arena screen.
- [x] Track events for pot raises, matches, submissions, rank changes, audits, and verdicts.
- [x] Add mock feed timestamps.
- [x] Add “new activity” pulse/flash state.
- [x] Add player-specific feed rows with avatar initials and event severity.

## Pot and financial pressure UI

- [x] Replace static pot text with an animated rolling odometer display.
- [ ] Add pot transaction ledger.
- [ ] Show individual pot contributions.
- [ ] Flash green when the pot increases.
- [ ] Flash red when a penalty or Vulture tax is applied.
- [ ] Show winner payout separately from gross weekly pot.
- [ ] Add mock Stripe/hold status labels without real payment execution.

## Ledger, archive, and wallet history

- [x] Replace the Members route with The Ledger.
- [x] Add Monthly Season standings with cumulative points and winner history.
- [x] Add settled-week Archive browsing with accordion entries.
- [x] Show archived achievement text, AI commentary, and verification previews.
- [x] Add BS Vote audit interaction with a pulsing Arena warning banner.
- [x] Add normal-page Wallet History route with credits, debits, holds, and fees.
- [x] Keep active-week standings and submission text hidden while browsing the Ledger.

## Weekly state machine

- [x] Add global weekly stage state: active, submission, lockout, reveal.
- [x] Make the Arena home screen change based on the current weekly stage.
- [x] Add Monday reveal lockout state.
- [x] Add Sunday submission lockout state outside the allowed window.
- [ ] Add Thursday/Saturday stakes escalation emphasis.

## Countdown pressure

- [x] Add Sunday submission countdown.
- [ ] Add Monday reveal countdown.
- [ ] Add raise-match countdown.
- [ ] Add BS audit countdown.
- [ ] Add countdown urgency states: calm, warning, critical.
- [ ] Add deadline copy that escalates as time runs out.

## Stakes Room upgrades

- [x] Replace basic slider styling with a heavy haptic-style bet slider.
- [x] Add browser vibration/haptic abstraction for web prototype.
- [ ] Add rising visual intensity as the raise amount increases.
- [x] Add hold-to-nuke button with 2-second progress ring.
- [x] Add nuke confirmation state.
- [ ] Add matched/pending/folded states for every player.
- [ ] Add urgent mock notification after nuke activation.

## Sunday Portal upgrades

- [x] Enforce 280-character limit visually and functionally.
- [x] Add submission quality hints focused on outcomes over effort.
- [ ] Add “fluff warning” mock detector for effort-heavy submissions.
- [x] Add locked submission receipt.
- [x] Add “not submitted” danger state.
- [x] Add character countdown severity styling.

## Monday Reveal upgrades

- [x] Animate bottom-up rank reveal from #5 to #1.
- [ ] Add final duo showdown state for ranks #2 and #1.
- [ ] Add winner explosion visual.
- [ ] Add rank-specific audio/haptic abstraction hooks.
- [x] Add winner payout transfer animation.
- [x] Add roast typing animation.
- [ ] Add reveal completion summary screen.

## Rank punishment and status effects

- [ ] Add screen-wide crimson punishment overlay when authenticated user is Rank #5.
- [ ] Add DRIFT badge behavior for regression.
- [ ] Add TURBO badge behavior for compounding wins.
- [ ] Add velocity arrows with stronger visual hierarchy.
- [ ] Add last-place persistent shame banner.
- [ ] Add rank movement history in player cards.

## BS Button audit system

- [ ] Add BS Button after Monday reveal.
- [ ] Add 2-hour audit window.
- [ ] Add majority vote mock logic.
- [ ] Add challenged submission state.
- [ ] Add proof-required modal.
- [ ] Add mock proof upload placeholder.
- [ ] Add validated/fraud penalty outcomes.
- [ ] Add audit event notifications.

## Vulture Protocol

- [ ] Add Vulture Protocol state machine:
  - [ ] Healthy Week
  - [ ] Slump Warning
  - [ ] Vulture Armed
  - [ ] Vulture Activated
  - [ ] Vault Funded
- [ ] Add Vulture Vault balance.
- [ ] Apply mock 30% pot seizure during slump state.
- [ ] Show winner payout after Vulture tax.
- [ ] Add group-wide roast banner.
- [ ] Add Vulture warning notifications.
- [ ] Add Vulture activation notification.

## AI judge and scoring model

- [ ] Move judge boundary toward server/API architecture.
- [ ] Replace client-only mock judge with API-shaped function.
- [ ] Add hardcoded business evaluation profiles:
  - [ ] Jett: net-new $30/mo Skool members.
  - [ ] Angus: recurring agency retainers and production contracts.
  - [ ] James: media distribution, streaming velocity, and pre-sales.
  - [ ] Ollie: software launch/deployment milestones.
  - [ ] Noah: software launch/deployment milestones.
- [ ] Add input-vs-outcome penalty rules.
- [ ] Add regression penalty rules.
- [ ] Add global slump/Vulture trigger output.
- [ ] Add strict JSON response schema.

## Player profiles

- [ ] Add player profile detail sheet.
- [ ] Show business endeavor and scoring criteria.
- [ ] Show milestone snapshot history.
- [ ] Show lifetime balance.
- [ ] Show rank trend.
- [ ] Show current week submission status.

## Live Activity / lock screen future prep

- [ ] Add mock Live Activity preview card.
- [ ] Model Live Activity states for pot, countdown, and reveal.
- [ ] Add copy for Dynamic Island / lock screen surfaces.
- [ ] Prepare data structure for future native iOS implementation.

## Accessibility and polish

- [ ] Ensure readable contrast in dark mode.
- [ ] Add reduced-motion fallback.
- [ ] Add keyboard-safe layout for submission terminal.
- [ ] Add semantic labels for icons/buttons.
- [ ] Add empty states for no notifications, no submissions, and no feed activity.
- [ ] Add loading skeletons for future backend reads.

## Backend preparation

- [ ] Define Supabase tables for users, rings, submissions, stakes, notifications, weekly results, audits, and vault state.
- [ ] Define Edge Function contract for judge evaluation.
- [ ] Define Edge Function contract for weekly cron.
- [ ] Define Edge Function contract for mock notification dispatch.
- [ ] Keep real Stripe/APNS/OpenAI execution behind future environment-variable setup.
