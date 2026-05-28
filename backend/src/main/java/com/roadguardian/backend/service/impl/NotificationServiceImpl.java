package com.roadguardian.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roadguardian.backend.exception.ResourceNotFoundException;
import com.roadguardian.backend.model.entity.Notification;
import com.roadguardian.backend.model.entity.User;
import com.roadguardian.backend.repository.NotificationRepository;
import com.roadguardian.backend.repository.UserRepository;
import com.roadguardian.backend.service.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;
	private final SimpMessagingTemplate messagingTemplate;

	@Override
	public Notification createNotification(Long userId, String title, String message, Notification.NotificationType type) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Notification notification = Notification.builder()
				.user(user)
				.title(title)
				.message(message)
				.type(type)
				.isRead(false)
				.build();
		return notificationRepository.save(notification);
	}

	@Override
	public List<Notification> getUserNotifications(Long userId) {
		return notificationRepository.findByUserId(userId);
	}

	@Override
	public List<Notification> getUnreadNotifications(Long userId) {
		return notificationRepository.findByUserIdAndIsRead(userId, false);
	}

	@Override
	public void markAsRead(Long notificationId) {
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
		notification.setIsRead(true);
		notificationRepository.save(notification);
	}

	@Override
	public void deleteNotification(Long notificationId) {
		if (!notificationRepository.existsById(notificationId)) {
			throw new ResourceNotFoundException("Notification not found");
		}
		notificationRepository.deleteById(notificationId);
	}

	@Override
	public void broadcastNewAccident(Long accidentId, String location) {
		log.info("Broadcasting new accident event via WebSocket: ID {}, Location: {}", accidentId, location);
		messagingTemplate.convertAndSend("/topic/accidents", 
			"NEW_ACCIDENT|" + accidentId + "|" + location);
	}
}
