package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.NotificationPreferenceRequest;
import com.smartcampus.backend.model.NotificationPreference;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferenceService {

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private UserService userService;

    public NotificationPreference getMyPreferences() {
        User user = userService.getCurrentUser();
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationPreference defaults = NotificationPreference.builder()
                            .userId(user.getId())
                            .build();
                    return preferenceRepository.save(defaults);
                });
    }

    public NotificationPreference updatePreferences(NotificationPreferenceRequest request) {
        User user = userService.getCurrentUser();
        NotificationPreference preference = preferenceRepository.findByUserId(user.getId())
                .orElse(NotificationPreference.builder().userId(user.getId()).build());

        preference.setBookingApproved(request.isBookingApproved());
        preference.setBookingRejected(request.isBookingRejected());
        preference.setBookingCancelled(request.isBookingCancelled());
        preference.setTicketStatusChanged(request.isTicketStatusChanged());
        preference.setNewComment(request.isNewComment());

        return preferenceRepository.save(preference);
    }

    public boolean shouldNotify(String userId, NotificationType type) {
        return preferenceRepository.findByUserId(userId)
                .map(preference -> switch (type) {
                    case NEW_BOOKING_REQUEST -> true;
                    case NEW_TICKET_CREATED -> true;
                    case BOOKING_CANCELLED_ADMIN -> true;
                    case BOOKING_APPROVED -> preference.isBookingApproved();
                    case BOOKING_REJECTED -> preference.isBookingRejected();
                    case BOOKING_CANCELLED -> preference.isBookingCancelled();
                    case TICKET_STATUS_CHANGED -> preference.isTicketStatusChanged();
                    case NEW_COMMENT -> preference.isNewComment();
                })
                .orElse(true);
    }
}
