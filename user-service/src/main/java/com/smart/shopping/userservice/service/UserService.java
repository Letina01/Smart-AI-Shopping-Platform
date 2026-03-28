package com.smart.shopping.userservice.service;

import com.smart.shopping.common.exception.BaseException;
import com.smart.shopping.userservice.entity.Address;
import com.smart.shopping.userservice.entity.UserProfile;
import com.smart.shopping.userservice.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserProfileRepository repository;

    public UserProfile getProfileByEmail(String email) {
        return repository.findByEmail(email)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setEmail(email);
                    newProfile.setName("User"); // Default name, should be updated by auth service if possible
                    return repository.save(newProfile);
                });
    }

    public UserProfile updateProfile(UserProfile profile) {
        UserProfile existing = getProfileByEmail(profile.getEmail());
        existing.setName(profile.getName());
        existing.setPhone(profile.getPhone());
        return repository.save(existing);
    }

    public UserProfile addAddress(String email, Address address) {
        UserProfile profile = getProfileByEmail(email);
        if (profile.getAddresses() == null) {
            profile.setAddresses(new ArrayList<>());
        }
        profile.getAddresses().add(address);
        return repository.save(profile);
    }

    public UserProfile deleteAddress(String email, Long addressId) {
        UserProfile profile = getProfileByEmail(email);
        profile.getAddresses().removeIf(a -> a.getId().equals(addressId));
        return repository.save(profile);
    }
}
