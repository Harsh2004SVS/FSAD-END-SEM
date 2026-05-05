package com.example.demo.service;

import com.example.demo.model.Match;
import com.example.demo.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired
    private MatchRepository matchRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatResponse(String userMessage) {
        // 1. Fetch current matches to provide as context
        List<Match> matches = matchRepository.findAllByOrderByDateAsc();
        StringBuilder context = new StringBuilder("You are a helpful Cricket Ticket Booking Assistant.\n");
        context.append("Here are the upcoming matches available for booking:\n");
        
        for (Match m : matches) {
            context.append("- ").append(m.getTeam1()).append(" vs ").append(m.getTeam2())
                   .append(" on ").append(m.getDate())
                   .append(" at ").append(m.getVenue())
                   .append(". Price: ₹").append(m.getTicketPrice())
                   .append(". Available tickets: ").append(m.getAvailableTickets())
                   .append("\n");
        }
        
        context.append("\nIf the user wants to book, tell them they can do so on the Matches page.\n");
        context.append("User says: ").append(userMessage).append("\n");
        context.append("Your response:");

        // Fallback if API key is not configured
        if (apiKey == null || apiKey.equals("YOUR_GEMINI_API_KEY_HERE") || apiKey.isEmpty()) {
            return generateMockResponse(userMessage, matches);
        }

        try {
            // 2. Call Gemini API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Using Map for cleaner JSON construction
            Map<String, Object> part = Map.of("text", context.toString());
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            // 3. Parse Response
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "I'm sorry, I couldn't process that right now.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Oops! My AI brain is currently disconnected (API Error). But you can always check the Matches page for info!";
        }
    }

    private String generateMockResponse(String userMessage, List<Match> matches) {
        String lowerMsg = userMessage.toLowerCase();
        if (lowerMsg.contains("india") || lowerMsg.contains("pakistan")) {
            return "The India vs Pakistan match is on Nov 5th at Narendra Modi Stadium! It's our most popular match. Tickets are ₹5000.";
        } else if (lowerMsg.contains("book") || lowerMsg.contains("ticket")) {
            return "You can easily book tickets by navigating to the 'Matches' page, selecting your desired match, and entering the number of tickets!";
        }
        return "Hello! I am your AI Cricket Assistant. (Note: Please configure your Gemini API Key in the backend for smart responses!). I can help you with match dates and ticket prices.";
    }
}
