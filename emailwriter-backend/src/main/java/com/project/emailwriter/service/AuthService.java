package com.project.emailwriter.service;


import com.project.emailwriter.model.LoginRequest;
import com.project.emailwriter.model.User;
import com.project.emailwriter.repository.UserRepository;
import com.project.emailwriter.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service

public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private Validation validation;

    public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository=userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(@NonNull User user) {
        if(!validation.isEmailValid(user.getEmail())){
            throw new IllegalArgumentException("Invalid email");
        }
        if(!validation.isPassValid(user.getPassword())){
            throw new IllegalArgumentException("Password is weak");
        }
        if(userRepository.existsByEmail(user.getEmail())){
            throw new EntityNotFoundException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!";
    }

    public String login(@NonNull LoginRequest loginRequest) {
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());
        if (user.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            return jwtUtil.generateToken(loginRequest.getEmail());
        }
        return "Invalid credentials!";
    }
}
