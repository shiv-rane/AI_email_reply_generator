package com.project.emailwriter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.emailwriter.model.EmailRequest;
import com.project.emailwriter.model.User;
import com.project.emailwriter.repository.UserRepository;
import io.lettuce.core.AbstractRedisAsyncCommands;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.udp.UdpServer;

import java.util.Map;

@Service
public class EmailService {

    private final WebClient webClient;

    @Autowired
    private UserRepository userRepository;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String GeminiApikey;

    public EmailService(WebClient.Builder webClientBuilder){
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest){


        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rate limit check
        if (!user.isPremium() && user.getGeneratedEmailsCount() >= 5) {
            return "Limit exceeded. Upgrade to premium!";
        }

        String prompt = buildPrompt(emailRequest);

        Map<String,Object> requestBody = Map.of(
                "contents",new Object[]{
                        Map.of("parts",new Object[]{
                                Map.of("text",prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl + GeminiApikey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        user.setGeneratedEmailsCount(user.getGeneratedEmailsCount() + 1);
        userRepository.save(user);

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response){
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }catch (Exception e){
            return "Error processing request " + e.getMessage();
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't generate a subject");
        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty()){
            prompt.append("use a").append(emailRequest.getTone()).append(" tone. ");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

}
