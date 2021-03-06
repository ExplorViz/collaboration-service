package net.explorviz.collaboration.service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.TemporalAmount;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import net.explorviz.collaboration.VrSocketTicket;
import net.explorviz.collaboration.model.UserModel;

/**
 * A service that manages drawn tickets that have not yet been used to establish the websocket
 * connection to join a room.
 *
 * When a user wants to join a room, they first draw a ticket and then use that ticket to establish
 * a websocket connection.
 */
@ApplicationScoped
public class TicketService {
  /**
   * Time for how long a ticket is valid.
   *
   * When the user draws a ticket, they have to establish the websocket connection within this
   * period.
   */
  private static final TemporalAmount TICKET_EXPIRY_PERIOD = Duration.ofSeconds(30);

  @Inject
  /* default */RoomService roomService; // NOCS

  /**
   * The tickets that have not yet been redeemed.
   */
  private final Map<String, VrSocketTicket> tickets = new ConcurrentHashMap<>();

  /**
   * Generates an unpredictable identifier for a ticket.
   *
   * Since the tickets are used for authentication, they must be unpredictable. Thus, the regular ID
   * generation service cannot be used.
   *
   * @return The generated ticket identifier.
   */
  private String generateTicketId() {
    return UUID.randomUUID().toString();
  }

  /**
   * Creates a new ticket for joining the the given room as the given user.
   *
   * @param room The room to join.
   * @param user The user who wants to join the room.
   * @return A ticket that allows the user to join the room.
   */
  public VrSocketTicket drawTicket(final Room room, final UserModel user) {
    final var ticketId = this.generateTicketId();
    final var validUntil = Instant.now().plus(TICKET_EXPIRY_PERIOD);
    final var ticket = new VrSocketTicket(ticketId, room, user, validUntil);
    this.tickets.put(ticketId, ticket);
    return ticket;
  }

  public VrSocketTicket redeemTicket(final String ticketId) {
    // Ensure that the ticket exists.
    if (!this.tickets.containsKey(ticketId)) {
      throw new IllegalStateException("Invalid ticket: " + ticketId);
    }

    // Get and remove the ticket.
    final var ticket = this.tickets.remove(ticketId);

    // Ensure that the room still exists.
    final var room = ticket.getRoom();
    if (!this.roomService.roomExists(room)) {
      throw new IllegalStateException(
          "Room " + room.getRoomId() + " for ticket " + ticketId + " has been closed");
    }

    // Test whether the ticket is still valid.
    final var expiryDate = ticket.getValidUntil();
    if (Instant.now().isAfter(expiryDate)) {
      // Notify the user service that the user model is not needed anymore.
      room.getUserService().removeUser(ticket.getUser());

      throw new IllegalStateException("Ticket " + ticketId + " expired at " + expiryDate);
    }

    return ticket;
  }
}
