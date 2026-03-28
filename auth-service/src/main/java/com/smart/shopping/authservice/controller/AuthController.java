package com.smart.shopping.authservice.controller;

import com.smart.shopping.authservice.entity.UserCredential;
import com.smart.shopping.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredential user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        return service.saveUser(user);
    }

    @PostMapping({"/token", "/login"})
    public String getToken(@RequestBody UserCredential authRequest) {
        if (authRequest.getEmail() == null || authRequest.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (authRequest.getPassword() == null || authRequest.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
        if (!authenticate.isAuthenticated()) {
            throw new IllegalArgumentException("Authentication failed");
        }
        return service.generateToken(authRequest.getEmail());
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }
}
