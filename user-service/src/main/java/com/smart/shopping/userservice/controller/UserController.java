package com.smart.shopping.userservice.controller;

import com.smart.shopping.userservice.entity.Address;
import com.smart.shopping.userservice.entity.UserProfile;
import com.smart.shopping.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping("/profile")
    public UserProfile getProfile(@RequestParam String email) {
        return service.getProfileByEmail(email);
    }

    @PutMapping("/profile")
    public UserProfile updateProfile(@RequestBody UserProfile profile) {
        return service.updateProfile(profile);
    }

    @PostMapping("/address")
    public UserProfile addAddress(@RequestParam String email, @RequestBody Address address) {
        return service.addAddress(email, address);
    }

    @DeleteMapping("/address/{id}")
    public UserProfile deleteAddress(@RequestParam String email, @PathVariable Long id) {
        return service.deleteAddress(email, id);
    }
}
