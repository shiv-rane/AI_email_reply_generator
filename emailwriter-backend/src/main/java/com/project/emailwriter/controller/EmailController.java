package com.project.emailwriter.controller;

import com.project.emailwriter.model.EmailRequest;
import com.project.emailwriter.service.EmailService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired
    private final EmailService emailService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<?> generateEmail(@RequestBody EmailRequest emailRequest) {
        String response = emailService.generateEmailReply(emailRequest);

        if(response == null){
            return ResponseEntity.status(401).body(
                    Map.of("error","Unable to generate email reply")
            );
        }

        if (response.equals("Limit exceeded. Upgrade to premium!")) {
            return ResponseEntity.status(403).body(
                    Map.of("error", "Limit exceeded. Upgrade to premium!")
            );
        }

        return ResponseEntity.ok(Map.of("reply", response));
    }

}
