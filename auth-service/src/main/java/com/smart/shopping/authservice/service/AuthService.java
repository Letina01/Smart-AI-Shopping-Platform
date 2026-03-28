package com.smart.shopping.authservice.service;

import com.smart.shopping.authservice.entity.UserCredential;
import com.smart.shopping.authservice.repository.UserCredentialRepository;
import com.smart.shopping.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String saveUser(UserCredential credential) {
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "user added to the system";
    }

    public String generateToken(String username) {
        return jwtUtil.generateToken(username);
    }

    public void validateToken(String token) {
        jwtUtil.validateToken(token);
    }

    public void saveOrUpdateOAuth2User(String email, String name) {
        repository.findByEmail(email).ifPresentOrElse(
                user -> {
                    user.setName(name);
                    repository.save(user);
                },
                () -> {
                    UserCredential newUser = new UserCredential();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    // No password for OAuth2 users or set a random one
                    newUser.setPassword(passwordEncoder.encode("OAUTH2_USER_" + Math.random()));
                    repository.save(newUser);
                }
        );
    }

}
