# 🏟️ BadgerPlay

**BadgerPlay** is a mobile-first web application built for UW–Madison students to organize and join pickup sports games on campus.

It functions as a real-time, campus-wide game board where students can create games, join others, and build a social sports network.

---

## 🚀 Core Concept

BadgerPlay solves a simple but common problem:

> “I want to play soccer right now — but who’s free?”

Users can:

* Post public or private pickup games
* Browse upcoming games
* Join instantly
* Chat with players
* Add friends and build a sports network

The system is designed to feel real-time, social, and mobile-native.

---

# ✨ Features

## 🔐 Authentication & Identity

* Email + password signup
* Passwords hashed using **bcrypt (10 salt rounds)**
* 6-digit OTP verification on first signup
* `.edu` emails receive a **"wisc.edu verified ✓"** badge
* Non-edu users are labeled as **Guest**
* Returning users log in with email + password only

---

## 🏀 Games Feed

* Displays all upcoming **public games**
* Sorted chronologically
* Each game card shows:

  * Sport (emoji + color-coded)
  * Location
  * Date & time
  * Skill level
  * Host name
  * Player avatars
  * Capacity progress bar
* Sport filter chips at the top
* Tapping a game opens a detail modal with:

  * Full player list
  * Clickable player profiles

---

## ➕ Create a Game

Users can create games by selecting:

* Sport (grid selection + custom option)
* Location (free text or campus quick-select chips)
* Date & time
* Max players (2–30)
* Skill level
* Optional description
* Public or Private toggle

---

## 🔒 Private Games System

Private games are:

* Hidden from the main feed
* Only accessible via in-chat invite
* Stored with:

  * `visibility: "private"`
  * Unique 8-character invite code
  * `invitedUsers` array

Backend enforcement:

* Feed endpoint excludes private games
* Join endpoint checks `invitedUsers`
* Game cannot be joined without invite

---

## 👥 My Games

Displays:

* 🌍 Public Games (joined/hosting)
* 🔒 Private Games (joined/hosting)

Hosted games include a **Manage** button for deletion.

After scheduled time:

* Game automatically moves to **Game History**

---

## 💬 Messaging & Friends

Two-tab social system:

### Messages

* Recent conversations
* Last message preview
* Real-time refresh (3s polling)
* New Message search

### Friends

* Add / accept / reject friend requests
* Pending request badge
* Quick actions:

  * 💬 Chat
  * 🏟️ Send Game Invite
  * ⋮ Remove friend

---

## 🏟️ In-Chat Game Invites

Inside any chat:

1. Host clicks “🏟️ Invite”
2. Selects one of their hosted games
3. Invite appears as a styled message bubble
4. Recipient sees:

   * Game details
   * Green “Join Game →” button
5. Clicking joins instantly

This is the **only method** to join private games.

---

## 👤 Player Profiles

Each profile displays:

* Avatar
* Name
* Verified/Guest badge
* Games Played count (dynamic)
* Top sport
* Favorite sports (emoji tags)

From profiles, users can:

* Send friend requests
* Start a chat
* View game history

All avatars and names in the app are clickable.

---

## 📜 Game Lifecycle

Games follow a natural lifecycle:

1. Created (future time)
2. Visible on feed
3. Players join
4. Time passes
5. Automatically removed from feed
6. Added to Game History

Feed query:

```js
time > now
```

History query:

```js
time < now
```

Games Played count is calculated dynamically from history.

---

# 🔮 Future Improvements

With more development time, we would add:

* WebSocket real-time messaging
* Push notifications
* Email-based OTP delivery
* Map view with geolocation
* Public deployment
* Scalable production environment
* Image uploads for avatars
* Admin moderation tools

---

# 🎯 Why We Built It

Pickup sports are inherently social and spontaneous. Existing tools (group chats, text threads) are fragmented and inefficient.

BadgerPlay centralizes:

* Discovery
* Coordination
* Social connection

Into a single, structured campus platform.

---

# 🏁 Tech Stack Summary

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | React 18, Vite, Tailwind CSS, React Router |
| Backend        | Node.js, Express.js                        |
| Database       | MongoDB Atlas, Mongoose                    |
| Authentication | bcryptjs, Custom OTP                       |
| Hosting        | Local development (MVP)                    |



