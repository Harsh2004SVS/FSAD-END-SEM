package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.model.Match;
import com.example.demo.model.User;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    public static class BookingRequest {
        public Long match_id;
        public Integer tickets_booked;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        if (request.match_id == null || request.tickets_booked == null || request.tickets_booked <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid booking details"));
        }

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        Optional<Match> optionalMatch = matchRepository.findById(request.match_id);
        if (!optionalMatch.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Match not found"));
        }

        Match match = optionalMatch.get();

        if (match.getAvailableTickets() < request.tickets_booked) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough tickets available"));
        }

        match.setAvailableTickets(match.getAvailableTickets() - request.tickets_booked);
        matchRepository.save(match);

        double totalCost = match.getTicketPrice() * request.tickets_booked;
        
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setMatch(match);
        booking.setTicketsBooked(request.tickets_booked);
        booking.setTotalCost(totalCost);
        booking.setBookingDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Booking successful");
        
        Map<String, Object> bookingDetails = new HashMap<>();
        bookingDetails.put("id", savedBooking.getId());
        bookingDetails.put("match", match.getTeam1() + " vs " + match.getTeam2());
        bookingDetails.put("tickets", savedBooking.getTicketsBooked());
        bookingDetails.put("total_cost", savedBooking.getTotalCost());
        bookingDetails.put("booking_date", savedBooking.getBookingDate());
        
        response.put("booking", bookingDetails);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<?> getUserBookings() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingDateDesc(user.getId());
        
        // Transform the response to match what the frontend expects
        List<Map<String, Object>> response = bookings.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("tickets_booked", b.getTicketsBooked());
            map.put("total_cost", b.getTotalCost());
            map.put("booking_date", b.getBookingDate());
            map.put("team1", b.getMatch().getTeam1());
            map.put("team2", b.getMatch().getTeam2());
            map.put("date", b.getMatch().getDate());
            map.put("venue", b.getMatch().getVenue());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
