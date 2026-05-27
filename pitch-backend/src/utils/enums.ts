/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const EventEnum = Object.freeze({
    // ? once user is ready to go
    CONNECTED_EVENT: "connected",
    // ? when user gets disconnected
    DISCONNECT_EVENT: "disconnect",
    // ? when user joins a socket room
    JOIN_CHAT_EVENT: "joinRoom",
    SLOT_BOOKED_EVENT: "slotBooked"
});

export const Events = Object.values(EventEnum);
