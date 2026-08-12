package com.sportzone.dto;

import com.sportzone.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        private UserRole role;

        public RegisterRequest() {}
        public RegisterRequest(String email, String password, String firstName, String lastName, UserRole role) {
            this.email = email;
            this.password = password;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private UserSummary user;

        public AuthResponse() {}
        public AuthResponse(String token, UserSummary user) {
            this.token = token;
            this.user = user;
        }

        public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }
        public static class AuthResponseBuilder {
            private String token;
            private UserSummary user;
            public AuthResponseBuilder token(String token) { this.token = token; return this; }
            public AuthResponseBuilder user(UserSummary user) { this.user = user; return this; }
            public AuthResponse build() { return new AuthResponse(token, user); }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserSummary getUser() { return user; }
        public void setUser(UserSummary user) { this.user = user; }
    }

    public static class UserSummary {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private UserRole role;

        public UserSummary() {}
        public UserSummary(UUID id, String email, String firstName, String lastName, UserRole role) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
        }

        public static UserSummaryBuilder builder() { return new UserSummaryBuilder(); }
        public static class UserSummaryBuilder {
            private UUID id;
            private String email;
            private String firstName;
            private String lastName;
            private UserRole role;

            public UserSummaryBuilder id(UUID id) { this.id = id; return this; }
            public UserSummaryBuilder email(String email) { this.email = email; return this; }
            public UserSummaryBuilder firstName(String firstName) { this.firstName = firstName; return this; }
            public UserSummaryBuilder lastName(String lastName) { this.lastName = lastName; return this; }
            public UserSummaryBuilder role(UserRole role) { this.role = role; return this; }
            public UserSummary build() { return new UserSummary(id, email, firstName, lastName, role); }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
    }
}

