package com.example.demo.controller;

import com.example.demo.service.AiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private AiChatService aiChatService;

    public static class ChatRequest {
        public String message;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        if (request.message == null || request.message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("reply", "Please say something!"));
        }

        String reply = aiChatService.getChatResponse(request.message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
