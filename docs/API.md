# CampusConnect API

Base URL: `http://localhost:5000/api` (replace with the deployed Render API URL). JSON request and response bodies are used unless stated otherwise.

`GET /api/health` is a public process health check and returns `{ "status": "ok", "service": "CampusConnect API" }`.

Protected routes require `Authorization: Bearer <JWT>`. A token is issued at login or student registration. Administrator routes additionally require the authenticated account to have `role: "admin"`. Errors use `{ "message": "..." }`; validation errors can also include an `errors` array.

## Authentication

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public, student only | Create a student account |
| POST | `/auth/login` | Public | Sign in |
| GET | `/auth/me` | Signed in | Return the current account |

Register body:

```json
{ "name": "Alex Johnson", "email": "alex@university.edu", "password": "at-least-8-characters" }
```

Successful registration/login returns `{ "token": "...", "user": { ... } }`. Admin accounts are created by `npm run create-admin` in `backend/`; no public admin signup endpoint exists.

## Events

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/events` | Public | List events, sorted by date |
| GET | `/events/:id` | Public | Event details |
| GET | `/events/stats` | Admin | Event, upcoming-event, and active-registration counts |
| POST | `/events` | Admin | Create event |
| PUT | `/events/:id` | Admin | Update event |
| DELETE | `/events/:id` | Admin | Delete event and its registrations |

Optional list query parameters: `search`, `category`, `from`, `to`, `upcoming=true`. `search` matches title, description, or venue. `category=All` is equivalent to no category filter.

Event body fields:

```json
{
  "title": "Web Development Workshop",
  "description": "A hands-on introduction to building for the web.",
  "category": "Workshop",
  "date": "2027-01-15",
  "startTime": "10:00",
  "endTime": "12:00",
  "venue": "Computer Science Block",
  "image": "https://example.edu/event.jpg",
  "capacity": 80,
  "organizer": "Developer Student Club"
}
```

Allowed categories: `Technology`, `Cultural`, `Workshop`, `Seminar`, `Sports`, `Competition`, `Business`, and `Other`. The end time must be after the start time, and event capacity cannot be lowered below its current registration count.

## Registrations

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/registrations` | Signed-in student | Register for an event |
| GET | `/registrations/my` | Signed in | List the current user's registrations |
| GET | `/registrations` | Admin | List registrations; optional `eventId` and `status` filters |
| DELETE | `/registrations/:id` | Owning student | Cancel an active registration |
| PATCH | `/registrations/:id/status` | Admin | Set `registered`, `cancelled`, or `attended` |

Register body: `{ "eventId": "<MongoDB event id>" }`. The API rejects past/full events and duplicate registrations, and atomically reserves event capacity before creating a registration. Registration status changes update the event's registered count.

## Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List student accounts |
| GET | `/users/:id` | Admin | Get a student account |
| PUT | `/users/profile` | Signed in | Update the current account's name, department, and year |

Profile body example:

```json
{ "name": "Alex Johnson", "department": "Computer Science", "year": 3 }
```

## Status codes

- `200` successful read/update/delete.
- `201` account, event, or registration created.
- `400` invalid input, identifier, or capacity update.
- `401` missing, invalid, or expired token.
- `403` authenticated account lacks the required role.
- `404` resource or route not found.
- `409` duplicate account/registration, full or past event, or conflicting registration state.
- `500` unexpected server/database error.
