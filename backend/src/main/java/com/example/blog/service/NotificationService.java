package com.example.blog.service;

import com.example.blog.dto.NotificationDTO;
import com.example.blog.exception.ForbiddenException;
import com.example.blog.exception.ResourceNotFoundException;
import com.example.blog.mapper.NotificationMapper;
import com.example.blog.model.Notification;
import com.example.blog.model.User;
import com.example.blog.repository.NotificationRepository;
import com.example.blog.security.UserSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final UserSecurity userSecurity;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserService userService,
            UserSecurity userSecurity
    ) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.userSecurity = userSecurity;
    }

    public void createNotification(
            @NonNull Long userId,
            @NonNull String message,
            @NonNull Notification.NotificationType type,
            Long referenceId
    ) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    /**
     * Creates notifications for multiple users in a single batch write
     * instead of one DB round-trip per user.
     */
    public void createNotificationsForUsers(
            @NonNull List<Long> userIds,
            @NonNull String message,
            @NonNull Notification.NotificationType type,
            Long referenceId
    ) {
        List<Notification> batch = new ArrayList<>(userIds.size());

        for (Long userId : userIds) {
            userService.getUserById(userId).ifPresentOrElse(
                user -> {
                    Notification n = new Notification();
                    n.setUser(user);
                    n.setMessage(message);
                    n.setType(type);
                    n.setReferenceId(referenceId);
                    n.setRead(false);
                    batch.add(n);
                },
                () -> log.warn("Skipped notification — user {} not found", userId)
            );
        }

        if (!batch.isEmpty()) {
            notificationRepository.saveAll(batch);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated");
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated");
        }

        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public void markAsRead(@NonNull Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!userSecurity.isOwnerOrAdmin(notification.getUser().getId())) {
            throw new ForbiddenException("You don't have permission to update this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated");
        }

        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(currentUserId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(@NonNull Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!userSecurity.isOwnerOrAdmin(notification.getUser().getId())) {
            throw new ForbiddenException("You don't have permission to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    public void deleteAllNotifications() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            throw new ForbiddenException("You must be authenticated");
        }

        notificationRepository.deleteByUserId(currentUserId);
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        Long currentUserId = userSecurity.getCurrentUserId();
        if (currentUserId == null) {
            return 0;
        }
        return notificationRepository.countByUserIdAndReadFalse(currentUserId);
    }
}
