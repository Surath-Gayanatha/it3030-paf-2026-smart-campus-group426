package com.smartcampus.backend.services;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationPreferenceService notificationPreferenceService;

    public List<Notification> getMyNotifications() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    public long getUnreadCount() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(currentUser.getId());
    }

    public Notification markAsRead(String notificationId) {
        User currentUser = userService.getCurrentUser();
        Notification notification = findOwnedNotification(notificationId, currentUser.getId());

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return notification;
    }

    public int markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(currentUser.getId());

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    public void deleteNotification(String notificationId) {
        User currentUser = userService.getCurrentUser();
        Notification notification = findOwnedNotification(notificationId, currentUser.getId());
        notificationRepository.delete(notification);
    }

    public Notification createNotification(
            String userId,
            String title,
            String message,
            NotificationType type,
            String referenceId
    ) {
        if (!notificationPreferenceService.shouldNotify(userId, type)) {
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();

        return notificationRepository.save(notification);
    }

    private Notification findOwnedNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!userId.equals(notification.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this notification");
        }

        return notification;
    }
}
