package com.smartcampus.backend.security.oauth2;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isEmpty()) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .role(Role.USER)
                    .provider("google")
                    .build();
            userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // This line is INSIDE the method
        String redirectUrl = FRONTEND_URL + "/oauth2/redirect?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}